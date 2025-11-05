import { NextRequest, NextResponse } from "next/server";
import {
  getSummaryReport,
  getTimePeriodReport,
  getCategoryReport,
  getUserReport,
  getDayStatsReport,
  getMonthlyLeaveReport,
} from "@/lib/reports";

// GET /api/reports?type=summary|time|category|user|day|monthly&...
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json(
        { error: "type parameter is required" },
        { status: 400 }
      );
    }

    switch (type) {
      case "summary": {
        const report = await getSummaryReport();
        return NextResponse.json(report);
      }

      case "time": {
        const periodType = (searchParams.get("periodType") || "month") as
          | "month"
          | "year";
        const reports = await getTimePeriodReport(periodType);
        return NextResponse.json(reports);
      }

      case "category": {
        const reports = await getCategoryReport();
        return NextResponse.json(reports);
      }

      case "user": {
        const reports = await getUserReport();
        return NextResponse.json(reports);
      }

      case "day": {
        const limit = searchParams.get("limit")
          ? parseInt(searchParams.get("limit")!, 10)
          : 10;
        const reports = await getDayStatsReport(limit);
        return NextResponse.json(reports);
      }

      case "monthly": {
        const year = searchParams.get("year");
        const month = searchParams.get("month");

        if (!year || month === null) {
          return NextResponse.json(
            {
              error:
                "year and month parameters are required for monthly report",
            },
            { status: 400 }
          );
        }

        const reports = await getMonthlyLeaveReport(
          parseInt(year, 10),
          parseInt(month, 10)
        );
        return NextResponse.json(reports);
      }

      default:
        return NextResponse.json(
          { error: `Unknown report type: ${type}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in GET /api/reports:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
