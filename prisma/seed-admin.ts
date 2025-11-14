import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedAdmin() {
  console.log("🌱 Seeding admin user...");

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@gladiatorrx.com" },
  });

  if (existingAdmin) {
    console.log("✅ Admin user already exists");
    console.log("📧 Email: admin@gladiatorrx.com");
    console.log("🔑 Password: GladiatorrX@2024!");
    return;
  }

  // Hash the admin password
  const hashedPassword = await bcrypt.hash("GladiatorrX@2024!", 10);

  // Create admin organization
  const adminOrg = await prisma.organization.upsert({
    where: { slug: "gladiatorrx" },
    update: {},
    create: {
      name: "GladiatorrX",
      slug: "gladiatorrx",
    },
  });

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@gladiatorrx.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
      organizationId: adminOrg.id,
    },
  });

  console.log("✅ Admin user created successfully!");
  console.log("📧 Email: admin@gladiatorrx.com");
  console.log("🔑 Password: GladiatorrX@2024!");
  console.log(`👤 User ID: ${admin.id}`);
  console.log(`🏢 Organization: ${adminOrg.name}`);
}

seedAdmin()
  .catch((e) => {
    console.error("❌ Error seeding admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
