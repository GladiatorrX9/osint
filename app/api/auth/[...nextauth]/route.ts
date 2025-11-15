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
          // Check if user exists
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { organization: true },
          });

          // If user doesn't exist, create one
          if (!existingUser) {
            // Create a default organization for the user
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

              return { user: newUser, organization };
            });

            console.log(
              `✅ New Google OAuth user created: ${result.user.email} (Org: ${result.organization.name})`
            );
          } else if (!existingUser.image && user.image) {
            // Update user image if they don't have one
            await prisma.user.update({
              where: { email: user.email },
              data: { image: user.image },
            });
          }

          return true;
        } catch (error) {
          console.error("Error in Google OAuth sign in:", error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // For initial sign in, fetch user data from database
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.id || token.sub;
        (session.user as any).role = token.role;
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
