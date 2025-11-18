import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// GET /api/uploads/profiles/[filename] - Serve uploaded profile images
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;

    // Security: Validate filename to prevent directory traversal
    if (!filename || filename.includes("..") || filename.includes("/")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    // Construct file path
    const filepath = join(
      process.cwd(),
      "public",
      "uploads",
      "profiles",
      filename
    );

    // Check if file exists
    if (!existsSync(filepath)) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Read file
    const fileBuffer = await readFile(filepath);

    // Determine content type based on file extension
    const extension = filename.split(".").pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
    };

    const contentType = contentTypeMap[extension || ""] || "image/jpeg";

    // Return image with proper headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving profile image:", error);
    return NextResponse.json(
      { error: "Failed to load image" },
      { status: 500 }
    );
  }
}
