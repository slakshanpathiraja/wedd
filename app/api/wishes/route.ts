import { NextRequest, NextResponse } from "next/server";
import { getAllWishes } from "@/lib/sheet";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const ic = request.nextUrl.searchParams.get("ic")?.trim() || undefined;
    const wishes = await getAllWishes(ic);
    // Rule: empty wish list eke penna epa eka string ekakhari thiyena wish tika ethanata danna
    const filteredWishes = wishes.filter(
      (item) => typeof item.wish === "string" && item.wish.trim().length > 0
    );

    return NextResponse.json({
      success: true,
      data: filteredWishes,
    });
  } catch (err: unknown) {
    console.error("Error fetching wishes:", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve wishes." },
      { status: 500 }
    );
  }
}

