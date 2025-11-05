import { Booking, LeaveCategory } from "@/types/booking";
import { getBookings, getDatesInRange } from "@/lib/booking";
import { getDaysCount } from "@/lib/dateUtils";

// Interface สำหรับรายงานสรุปตามช่วงเวลา
export interface TimePeriodReport {
  period: string; // "2024-01" หรือ "2024"
  totalBookings: number;
  totalDays: number;
  domesticBookings: number;
  internationalBookings: number;
  domesticDays: number;
  internationalDays: number;
}

// Interface สำหรับรายงานตามผู้ใช้
export interface UserReport {
  userId: string;
  userName: string;
  totalBookings: number;
  totalDays: number;
  domesticBookings: number;
  internationalBookings: number;
  domesticDays: number;
  internationalDays: number;
}

// Interface สำหรับรายงานสถิติวัน
export interface DayStatsReport {
  date: string;
  dateDisplay: string;
  bookingCount: number;
  users: string[];
}

// Interface สำหรับรายงานการลาแบบรายเดือน
export interface MonthlyLeaveReport {
  date: string; // YYYY-MM-DD
  dateDisplay: string; // วัน เดือน ปี (ไทย)
  dayOfWeek: string; // วันในสัปดาห์
  bookings: {
    userName: string;
    category: LeaveCategory;
    categoryLabel: string;
    startDate: string;
    endDate?: string;
    isMultiDay: boolean;
  }[];
}

// Interface สำหรับรายงานสรุปตามประเภท
export interface CategoryReport {
  category: LeaveCategory;
  categoryLabel: string;
  totalBookings: number;
  totalDays: number;
  averageDays: number;
  uniqueUsers: number;
}

// คำนวณจำนวนวันในการลา
const calculateDays = (booking: Booking): number => {
  if (booking.endDate && booking.endDate !== booking.date) {
    const start = new Date(booking.date);
    const end = new Date(booking.endDate);
    return getDaysCount(start, end);
  }
  return 1;
};

// รายงานสรุปตามช่วงเวลา (รายเดือน/รายปี)
export const getTimePeriodReport = async (
  periodType: "month" | "year" = "month"
): Promise<TimePeriodReport[]> => {
  const bookings = await getBookings();
  const reports: Map<string, TimePeriodReport> = new Map();

  bookings.forEach((booking) => {
    const date = new Date(booking.date);
    let period: string;

    if (periodType === "month") {
      period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
    } else {
      period = String(date.getFullYear());
    }

    if (!reports.has(period)) {
      reports.set(period, {
        period,
        totalBookings: 0,
        totalDays: 0,
        domesticBookings: 0,
        internationalBookings: 0,
        domesticDays: 0,
        internationalDays: 0,
      });
    }

    const report = reports.get(period)!;
    const days = calculateDays(booking);

    report.totalBookings++;
    report.totalDays += days;

    if (booking.category === "domestic") {
      report.domesticBookings++;
      report.domesticDays += days;
    } else {
      report.internationalBookings++;
      report.internationalDays += days;
    }
  });

  // เรียงตาม period ล่าสุดก่อน
  return Array.from(reports.values()).sort((a, b) =>
    b.period.localeCompare(a.period)
  );
};

// รายงานตามผู้ใช้
export const getUserReport = async (): Promise<UserReport[]> => {
  const bookings = await getBookings();
  const reports: Map<string, UserReport> = new Map();

  bookings.forEach((booking) => {
    if (!reports.has(booking.userId)) {
      reports.set(booking.userId, {
        userId: booking.userId,
        userName: booking.userName,
        totalBookings: 0,
        totalDays: 0,
        domesticBookings: 0,
        internationalBookings: 0,
        domesticDays: 0,
        internationalDays: 0,
      });
    }

    const report = reports.get(booking.userId)!;
    const days = calculateDays(booking);

    report.totalBookings++;
    report.totalDays += days;

    if (booking.category === "domestic") {
      report.domesticBookings++;
      report.domesticDays += days;
    } else {
      report.internationalBookings++;
      report.internationalDays += days;
    }
  });

  // เรียงตามจำนวนวันลามากที่สุดก่อน
  return Array.from(reports.values()).sort((a, b) => b.totalDays - a.totalDays);
};

// รายงานสถิติวัน (วันไหนมีการลามากที่สุด)
export const getDayStatsReport = async (
  limit: number = 10
): Promise<DayStatsReport[]> => {
  const bookings = await getBookings();
  const dayStats: Map<string, { users: Set<string>; count: number }> =
    new Map();

  bookings.forEach((booking) => {
    // เก็บทุกวันในช่วงการลา
    const dates =
      booking.endDate && booking.endDate !== booking.date
        ? getDatesInRange(booking.date, booking.endDate)
        : [booking.date];

    dates.forEach((date) => {
      if (!dayStats.has(date)) {
        dayStats.set(date, { users: new Set(), count: 0 });
      }

      const stats = dayStats.get(date)!;
      stats.users.add(booking.userName);
      stats.count++;
    });
  });

  // แปลงเป็น array และเรียงตามจำนวนการจองมากที่สุด
  const reports: DayStatsReport[] = Array.from(dayStats.entries())
    .map(([date, stats]) => {
      const dateObj = new Date(date);
      const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
      const months = [
        "ม.ค.",
        "ก.พ.",
        "มี.ค.",
        "เม.ย.",
        "พ.ค.",
        "มิ.ย.",
        "ก.ค.",
        "ส.ค.",
        "ก.ย.",
        "ต.ค.",
        "พ.ย.",
        "ธ.ค.",
      ];

      const dayName = dayNames[dateObj.getDay()];
      const day = dateObj.getDate();
      const month = months[dateObj.getMonth()];
      const year = dateObj.getFullYear() + 543;

      return {
        date,
        dateDisplay: `${dayName} ${day} ${month} ${year}`,
        bookingCount: stats.count,
        users: Array.from(stats.users),
      };
    })
    .sort((a, b) => {
      // เรียงตามจำนวนการจองมากที่สุดก่อน
      if (b.bookingCount !== a.bookingCount) {
        return b.bookingCount - a.bookingCount;
      }
      // ถ้าจำนวนเท่ากัน เรียงตามวันที่ล่าสุดก่อน
      return b.date.localeCompare(a.date);
    })
    .slice(0, limit);

  return reports;
};

// รายงานสรุปตามประเภทการลา
export const getCategoryReport = async (): Promise<CategoryReport[]> => {
  const bookings = await getBookings();
  const categoryStats: Map<
    LeaveCategory,
    {
      bookings: Booking[];
      totalDays: number;
      users: Set<string>;
    }
  > = new Map();

  bookings.forEach((booking) => {
    if (!categoryStats.has(booking.category)) {
      categoryStats.set(booking.category, {
        bookings: [],
        totalDays: 0,
        users: new Set(),
      });
    }

    const stats = categoryStats.get(booking.category)!;
    stats.bookings.push(booking);
    stats.totalDays += calculateDays(booking);
    stats.users.add(booking.userId);
  });

  const reports: CategoryReport[] = Array.from(categoryStats.entries()).map(
    ([category, stats]) => {
      const categoryLabel = category === "domestic" ? "ในประเทศ" : "นอกประเทศ";
      const averageDays =
        stats.bookings.length > 0
          ? Math.round((stats.totalDays / stats.bookings.length) * 10) / 10
          : 0;

      return {
        category,
        categoryLabel,
        totalBookings: stats.bookings.length,
        totalDays: stats.totalDays,
        averageDays,
        uniqueUsers: stats.users.size,
      };
    }
  );

  // เรียงตามจำนวนการจองมากที่สุดก่อน
  return reports.sort((a, b) => b.totalBookings - a.totalBookings);
};

// รายงานสรุปภาพรวม
export interface SummaryReport {
  totalBookings: number;
  totalDays: number;
  totalUsers: number;
  domesticBookings: number;
  internationalBookings: number;
  domesticDays: number;
  internationalDays: number;
  averageDaysPerBooking: number;
  mostPopularDay?: DayStatsReport;
  mostActiveUser?: UserReport;
}

export const getSummaryReport = async (): Promise<SummaryReport> => {
  const bookings = await getBookings();
  const users = new Set<string>();

  let totalDays = 0;
  let domesticBookings = 0;
  let internationalBookings = 0;
  let domesticDays = 0;
  let internationalDays = 0;

  bookings.forEach((booking) => {
    users.add(booking.userId);
    const days = calculateDays(booking);
    totalDays += days;

    if (booking.category === "domestic") {
      domesticBookings++;
      domesticDays += days;
    } else {
      internationalBookings++;
      internationalDays += days;
    }
  });

  const averageDaysPerBooking =
    bookings.length > 0
      ? Math.round((totalDays / bookings.length) * 10) / 10
      : 0;

  // ดึงข้อมูลวันยอดนิยมและผู้ใช้ที่ลาบ่อยที่สุด
  const dayStats = await getDayStatsReport(1);
  const userReports = await getUserReport();

  return {
    totalBookings: bookings.length,
    totalDays,
    totalUsers: users.size,
    domesticBookings,
    internationalBookings,
    domesticDays,
    internationalDays,
    averageDaysPerBooking,
    mostPopularDay: dayStats[0],
    mostActiveUser: userReports[0],
  };
};

// รายงานการลาแบบรายเดือน (แสดงว่าแต่ละวันมีใครลา)
export const getMonthlyLeaveReport = async (
  year: number,
  month: number // 0-11 (January = 0)
): Promise<MonthlyLeaveReport[]> => {
  const bookings = await getBookings();

  // คำนวณวันแรกและวันสุดท้ายของเดือน
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // สร้าง array ของทุกวันในเดือน
  const daysInMonth: MonthlyLeaveReport[] = [];
  const currentDate = new Date(firstDay);

  const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  const monthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  while (currentDate <= lastDay) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const dayOfWeek = dayNames[currentDate.getDay()];
    const day = currentDate.getDate();
    const monthName = monthNames[currentDate.getMonth()];
    const yearThai = currentDate.getFullYear() + 543;

    // หาการจองที่ตรงกับวันนี้
    const dayBookings = bookings.filter((booking) => {
      const bookingStart = new Date(booking.date);
      const bookingEnd = booking.endDate
        ? new Date(booking.endDate)
        : bookingStart;
      const checkDate = new Date(dateStr);

      // ตรวจสอบว่าวันนี้อยู่ในช่วงการจองหรือไม่
      return checkDate >= bookingStart && checkDate <= bookingEnd;
    });

    // แปลงข้อมูลการจอง
    const bookingData = dayBookings.map((booking) => {
      const isMultiDay = !!(
        booking.endDate && booking.endDate !== booking.date
      );
      const categoryLabel =
        booking.category === "domestic" ? "ในประเทศ" : "นอกประเทศ";

      return {
        userName: booking.userName,
        category: booking.category,
        categoryLabel,
        startDate: booking.date,
        endDate: booking.endDate,
        isMultiDay,
      };
    });

    daysInMonth.push({
      date: dateStr,
      dateDisplay: `${day} ${monthName} ${yearThai}`,
      dayOfWeek,
      bookings: bookingData,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return daysInMonth;
};
