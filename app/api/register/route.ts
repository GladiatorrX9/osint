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

    // Create organization and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: "admin", // First user is admin
          organizationId: organization.id,
        },
      });

      return { user, organization };
    });

    return NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        organizationId: result.user.organizationId,
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
