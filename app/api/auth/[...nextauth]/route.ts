import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          console.log(`❌ User not found or no password: ${credentials.email}`);
          throw new Error("Invalid credentials");
        }

        console.log(`🔐 Attempting login for: ${user.email}`);
        console.log(`Password length provided: ${credentials.password.length}`);
        console.log(`Stored hash: ${user.password.substring(0, 20)}...`);

        const isCorrectPassword = await compare(
          credentials.password,
          user.password
        );

        console.log(`Password match: ${isCorrectPassword}`);

        if (!isCorrectPassword) {
          console.log("❌ Password mismatch");
          throw new Error("Invalid credentials");
        }

        // Check if 2FA is enabled
        if (user.twoFactorEnabled && user.twoFactorSecret) {
          if (!credentials.twoFactorCode) {
            console.log("🔐 2FA required for:", user.email);
            throw new Error("2FA_REQUIRED");
          }

          // Verify 2FA code
          const speakeasy = require("speakeasy");
          const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token: credentials.twoFactorCode,
            window: 2,
          });

          if (!verified) {
            console.log("❌ 2FA verification failed for:", user.email);
            throw new Error("Invalid 2FA code");
          }

          console.log("✅ 2FA verified for:", user.email);
        }

        console.log(`✅ Login successful for: ${user.email}`);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign in
      if (account?.provider === "google" && user.email) {
        try {
          // Check if user already exists
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { organization: true },
          });

          // If user exists, allow login and update image if needed
          if (existingUser) {
            if (!existingUser.image && user.image) {
              await prisma.user.update({
                where: { email: user.email },
                data: { image: user.image },
              });
            }
            console.log(`✅ Google OAuth login: ${existingUser.email}`);
            return true;
          }

          // User doesn't exist - check waitlist status
          const waitlistEntry = await prisma.waitlist.findUnique({
            where: { email: user.email },
          });

          // If not on waitlist, deny access
          if (!waitlistEntry) {
            console.log(
              `❌ Google OAuth denied: ${user.email} - Not on waitlist`
            );
            return "/register?error=not_on_waitlist";
          }

          // If on waitlist but not approved, deny access
          if (waitlistEntry.status !== "APPROVED") {
            console.log(
              `❌ Google OAuth denied: ${user.email} - Waitlist status: ${waitlistEntry.status}`
            );
            return `/register?error=waitlist_${waitlistEntry.status.toLowerCase()}`;
          }

          // User is approved on waitlist - create account
          const organizationName = user.name || user.email.split("@")[0];
          const slug = organizationName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

          const result = await prisma.$transaction(async (tx) => {
            // Create organization
            const organization = await tx.organization.create({
              data: {
                name: organizationName,
                slug: `${slug}-${Date.now()}`,
              },
            });

            // Create user
            const newUser = await tx.user.create({
              data: {
                email: user.email!,
                name: user.name || user.email!.split("@")[0],
                image: user.image,
                organizationId: organization.id,
                // No password for OAuth users
                password: null,
              },
            });

            // Create team member with OWNER role
            await tx.teamMember.create({
              data: {
                userId: newUser.id,
                organizationId: organization.id,
                role: "OWNER",
              },
            });

            // Clear the onboarding token (mark as used)
            await tx.waitlist.update({
              where: { id: waitlistEntry.id },
              data: {
                onboardingToken: null,
                tokenExpiresAt: null,
              },
            });

            return { user: newUser, organization };
          });

          console.log(
            `✅ New Google OAuth user created from approved waitlist: ${result.user.email} (Org: ${result.organization.name})`
          );

          return true;
        } catch (error) {
          console.error("Error in Google OAuth sign in:", error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      // On sign in or when session is updated, fetch latest user data
      if (user || trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { email: user?.email || token.email! },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser.id;
          token.image = dbUser.image;
          token.name = dbUser.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        // Always fetch latest user data from database to ensure fresh data
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email! },
        });

        if (dbUser) {
          (session.user as any).id = dbUser.id;
          (session.user as any).role = dbUser.role;
          session.user.name = dbUser.name;
          session.user.image = dbUser.image;

          console.log(
            `📸 Session updated for ${dbUser.email}, image: ${
              dbUser.image ? "set" : "null"
            }`
          );
        } else {
          // Fallback to token data if DB query fails
          (session.user as any).id = token.id || token.sub;
          (session.user as any).role = token.role;
          if (token.image) session.user.image = token.image as string;
          if (token.name) session.user.name = token.name as string;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
