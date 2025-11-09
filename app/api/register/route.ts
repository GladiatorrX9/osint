import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, name, password, organizationName } = await req.json();

    if (!email || !name || !password || !organizationName) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    const hashedPassword = await hash(password, 12);

    // Generate organization slug from name
    const slug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Create organization and user with OWNER role in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: "ADMIN",
          organizationId: organization.id,
        },
      });

      // Create team member record (OWNER role)
      await tx.teamMember.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: "OWNER",
          status: "ACTIVE",
        },
      });

      return { user, organization };
    });

    return NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
      organization: {
        id: result.organization.id,
        name: result.organization.name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
