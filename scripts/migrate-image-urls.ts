import { prisma } from "../lib/prisma";

/**
 * Migration script to update existing image URLs from /uploads/profiles/
 * to /api/uploads/profiles/ for production compatibility
 */
async function migrateImageUrls() {
  try {
    console.log("🔄 Starting image URL migration...");

    // Find all users with image URLs that don't start with /api/
    const usersToUpdate = await prisma.user.findMany({
      where: {
        image: {
          not: null,
          startsWith: "/uploads/profiles/",
        },
      },
    });

    console.log(`📊 Found ${usersToUpdate.length} users to update`);

    // Update each user's image URL
    for (const user of usersToUpdate) {
      if (user.image) {
        const newImageUrl = user.image.replace(
          "/uploads/profiles/",
          "/api/uploads/profiles/"
        );

        await prisma.user.update({
          where: { id: user.id },
          data: { image: newImageUrl },
        });

        console.log(`✅ Updated ${user.email}: ${user.image} → ${newImageUrl}`);
      }
    }

    console.log("✨ Migration complete!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateImageUrls();
