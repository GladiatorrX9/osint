import { NextRequest, NextResponse } from "next/server";
import type { LeakOSINTRequest, LeakOSINTResponse } from "@/types/api";

const API_URL = "https://leakosintapi.com/";
const API_TOKEN = process.env.LEAKOSINT_API_TOKEN || "1388845031:9sliWRXS";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Invalid query parameter" },
        { status: 400 }
      );
    }

    const requestBody: LeakOSINTRequest = {
      token: API_TOKEN,
      request: query,
      limit: 100,
      lang: "en",
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data: LeakOSINTResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
