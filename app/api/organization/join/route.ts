import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, name, password, organizationId } = await req.json();

    if (!email || !name || !password || !organizationId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    // Check if organization exists and has less than 2 users
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        users: true,
      },
    });

    if (!organization) {
      return new NextResponse("Organization not found", { status: 404 });
    }

    if (organization.users.length >= 2) {
      return new NextResponse("Organization is full (maximum 2 users)", {
        status: 400,
      });
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "user",
        organizationId: organization.id,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organizationId: user.organizationId,
      },
      organization: {
        id: organization.id,
        name: organization.name,
      },
    });
  } catch (error) {
    console.error("Join organization error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
