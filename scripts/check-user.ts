import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function checkUser(email: string, testPassword?: string) {
  try {
    console.log(`\n🔍 Checking user: ${email}`);
    console.log("=".repeat(50));

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
      },
    });

    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log("✅ User found:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Organization: ${user.organization?.name || "None"}`);
    console.log(`   Has Password: ${!!user.password}`);

    if (user.password) {
      console.log(
        `   Password Hash (first 30 chars): ${user.password.substring(
          0,
          30
        )}...`
      );
      console.log(`   Hash Length: ${user.password.length}`);

      // bcrypt hashes start with $2a$, $2b$, or $2y$ followed by cost and salt
      const hashPrefix = user.password.substring(0, 4);
      console.log(`   Hash Prefix: ${hashPrefix}`);

      if (!hashPrefix.startsWith("$2")) {
        console.log("   ⚠️  WARNING: Hash doesn't look like bcrypt format!");
      }
    }

    if (testPassword && user.password) {
      console.log(`\n🔐 Testing password: "${testPassword}"`);
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log(`   Result: ${isMatch ? "✅ MATCH" : "❌ NO MATCH"}`);

      // Test hashing the same password
      console.log(`\n🧪 Testing hash generation:`);
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log(`   New hash: ${newHash.substring(0, 30)}...`);
      const newMatch = await bcrypt.compare(testPassword, newHash);
      console.log(`   New hash works: ${newMatch ? "✅ YES" : "❌ NO"}`);
    }

    console.log("=".repeat(50));
  } catch (error) {
    console.error("Error checking user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line args
const email = process.argv[2];
const testPassword = process.argv[3];

if (!email) {
  console.log("Usage: tsx scripts/check-user.ts <email> [password-to-test]");
  console.log(
    "Example: tsx scripts/check-user.ts user@example.com mypassword123"
  );
  process.exit(1);
}

checkUser(email, testPassword);
