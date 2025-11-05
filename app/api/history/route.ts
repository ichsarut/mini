import { NextRequest, NextResponse } from "next/server";
import {
  getAllHistory,
  getHistoryByBookingId,
  getHistoryByUserId,
} from "@/lib/history";

// GET /api/history - Get all history
// GET /api/history?bookingId=xxx - Get history by booking ID
// GET /api/history?userId=xxx - Get history by user ID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bookingId = searchParams.get("bookingId");
    const userId = searchParams.get("userId");
    const limit = searchParams.get("limit");

    if (bookingId) {
      const history = await getHistoryByBookingId(bookingId);
      return NextResponse.json(history);
    }

    if (userId) {
      const history = await getHistoryByUserId(userId);
      return NextResponse.json(history);
    }

    // Get all history
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const history = await getAllHistory(limitNum);
    return NextResponse.json(history);
  } catch (error) {
    console.error("Error in GET /api/history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
