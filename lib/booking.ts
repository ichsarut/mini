import { Booking, LeaveCategory } from "@/types/booking";
import { logCreate, logUpdate, logDelete } from "@/lib/history";
import { supabase } from "@/lib/supabase";

// ดึงข้อมูลการจองทั้งหมด
export const getBookings = async (): Promise<Booking[]> => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      console.error("Failed to get bookings:", error);
      return [];
    }

    // แปลงข้อมูลจาก Supabase format เป็น Booking format
    return (
      data?.map((row) => ({
        id: row.id,
        date: row.date,
        endDate: row.end_date || undefined,
        userId: row.user_id,
        userName: row.user_name,
        category: row.category,
        reason: row.reason || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at || undefined,
      })) || []
    );
  } catch (error) {
    console.error("Failed to get bookings:", error);
    return [];
  }
};

// บันทึกการจองใหม่
export const saveBooking = async (
  booking: Omit<Booking, "id" | "createdAt">
): Promise<Booking> => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        date: booking.date,
        end_date: booking.endDate || null,
        user_id: booking.userId,
        user_name: booking.userName,
        category: booking.category,
        reason: booking.reason || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to save booking:", error);
      throw error;
    }

    const newBooking: Booking = {
      id: data.id,
      date: data.date,
      endDate: data.end_date || undefined,
      userId: data.user_id,
      userName: data.user_name,
      category: data.category,
      reason: data.reason || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at || undefined,
    };

    // บันทึกประวัติการสร้าง
    await logCreate(newBooking);

    return newBooking;
  } catch (error) {
    console.error("Failed to save booking:", error);
    throw error;
  }
};

// อัปเดตการจอง
export const updateBooking = async (
  bookingId: string,
  updates: Partial<Omit<Booking, "id" | "userId" | "userName" | "createdAt">>
): Promise<Booking | null> => {
  try {
    // ดึงข้อมูลเก่าก่อนแก้ไข
    const { data: oldBooking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (fetchError || !oldBooking) {
      console.error("Failed to fetch booking for update:", fetchError);
      return null;
    }

    // เก็บข้อมูลเก่าก่อนแก้ไข
    const oldData: Partial<Booking> = {
      date: oldBooking.date,
      endDate: oldBooking.end_date || undefined,
      category: oldBooking.category,
      reason: oldBooking.reason || undefined,
      updatedAt: oldBooking.updated_at || undefined,
    };

    // อัปเดตข้อมูล
    const { data, error } = await supabase
      .from("bookings")
      .update({
        date: updates.date,
        end_date: updates.endDate || null,
        category: updates.category,
        reason: updates.reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (error) {
      console.error("Failed to update booking:", error);
      return null;
    }

    // เก็บข้อมูลใหม่หลังแก้ไข
    const newData: Partial<Booking> = {
      date: data.date,
      endDate: data.end_date || undefined,
      category: data.category,
      reason: data.reason || undefined,
      updatedAt: data.updated_at || undefined,
    };

    // บันทึกประวัติการแก้ไข
    await logUpdate(
      bookingId,
      oldBooking.user_id,
      oldBooking.user_name,
      oldData,
      newData
    );

    return {
      id: data.id,
      date: data.date,
      endDate: data.end_date || undefined,
      userId: data.user_id,
      userName: data.user_name,
      category: data.category,
      reason: data.reason || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at || undefined,
    };
  } catch (error) {
    console.error("Failed to update booking:", error);
    return null;
  }
};

// ลบการจอง
export const deleteBooking = async (bookingId: string): Promise<boolean> => {
  try {
    // ดึงข้อมูลการจองก่อนลบ
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      console.error("Failed to fetch booking for delete:", fetchError);
      return false;
    }

    // เก็บข้อมูลการจองก่อนลบ
    const bookingData: Partial<Booking> = {
      date: booking.date,
      endDate: booking.end_date || undefined,
      category: booking.category,
      reason: booking.reason || undefined,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at || undefined,
    };

    // ลบการจอง
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    if (error) {
      console.error("Failed to delete booking:", error);
      return false;
    }

    // บันทึกประวัติการลบ
    await logDelete(bookingId, booking.user_id, booking.user_name, bookingData);

    return true;
  } catch (error) {
    console.error("Failed to delete booking:", error);
    return false;
  }
};

// ดึงข้อมูลการจองตามวันที่
export const getBookingsByDate = async (date: string): Promise<Booking[]> => {
  try {
    // ดึงข้อมูลที่อาจมีวันที่ตรงกัน (วันเริ่มต้น = date หรืออยู่ในช่วง date)
    const checkDate = new Date(date);
    const checkDateStr = checkDate.toISOString().split("T")[0];

    // Query วันที่เริ่มต้นตรงกัน
    const { data: exactDateData, error: exactError } = await supabase
      .from("bookings")
      .select("*")
      .eq("date", checkDateStr);

    if (exactError) {
      console.error("Failed to get bookings by date:", exactError);
    }

    // Query วันที่อยู่ในช่วง (date <= checkDate <= end_date)
    const { data: rangeData, error: rangeError } = await supabase
      .from("bookings")
      .select("*")
      .lte("date", checkDateStr)
      .gte("end_date", checkDateStr)
      .not("end_date", "is", null);

    if (rangeError) {
      console.error("Failed to get bookings by date range:", rangeError);
    }

    // รวมข้อมูลและลบ duplicates
    const allBookings = [...(exactDateData || []), ...(rangeData || [])];

    // ลบ duplicates โดยใช้ Set
    const uniqueBookings = Array.from(
      new Map(allBookings.map((b) => [b.id, b])).values()
    );

    // กรองข้อมูลให้ตรงกับวันที่ที่ต้องการ
    const filtered = uniqueBookings.filter((b) => {
      if (b.date === checkDateStr) return true;
      if (b.end_date) {
        const start = new Date(b.date);
        const end = new Date(b.end_date);
        return checkDate >= start && checkDate <= end;
      }
      return false;
    });

    return filtered.map((row) => ({
      id: row.id,
      date: row.date,
      endDate: row.end_date || undefined,
      userId: row.user_id,
      userName: row.user_name,
      category: row.category,
      reason: row.reason || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at || undefined,
    }));
  } catch (error) {
    console.error("Failed to get bookings by date:", error);
    return [];
  }
};

// Helper: Get all dates in a range
export const getDatesInRange = (
  startDate: string,
  endDate: string
): string[] => {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

// ดึงข้อมูลการจองตามเดือน
export const getBookingsByMonth = async (
  year: number,
  month: number
): Promise<Booking[]> => {
  try {
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) {
      console.error("Failed to get bookings by month:", error);
      return [];
    }

    return (
      data?.map((row) => ({
        id: row.id,
        date: row.date,
        endDate: row.end_date || undefined,
        userId: row.user_id,
        userName: row.user_name,
        category: row.category,
        reason: row.reason || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at || undefined,
      })) || []
    );
  } catch (error) {
    console.error("Failed to get bookings by month:", error);
    return [];
  }
};

export const getLeaveCategoryLabel = (category: LeaveCategory): string => {
  const labels: Record<LeaveCategory, string> = {
    domestic: "ในประเทศ",
    international: "นอกประเทศ",
  };
  return labels[category];
};

export const getMaxDays = (category: LeaveCategory): number => {
  return category === "domestic" ? 7 : 9;
};

// Validation functions
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ตรวจสอบว่าวันนั้นมีคนจองเกิน 2 คนหรือยัง
export const validateDateCapacity = async (
  date: string,
  excludeBookingId?: string
): Promise<ValidationResult> => {
  const bookings = await getBookingsByDate(date);
  const filtered = excludeBookingId
    ? bookings.filter((b) => b.id !== excludeBookingId)
    : bookings;

  if (filtered.length >= 2) {
    return {
      valid: false,
      error: "วันนี้มีการจองครบ 2 คนแล้ว",
    };
  }

  return { valid: true };
};

// ตรวจสอบว่าลาหลายวันเกินจำนวนที่กำหนดหรือไม่
export const validateMaxDays = (
  startDate: string,
  endDate: string,
  category: LeaveCategory
): ValidationResult => {
  const dates = getDatesInRange(startDate, endDate);
  const days = dates.length;
  const maxDays = getMaxDays(category);

  if (days > maxDays) {
    return {
      valid: false,
      error: `ลาประเภท${getLeaveCategoryLabel(
        category
      )}สามารถลาสูงสุด ${maxDays} วัน (คุณลาทั้งหมด ${days} วัน)`,
    };
  }

  return { valid: true };
};

// ตรวจสอบว่าคนนี้ลาหลายเดือนเกิน 1 ครั้งหรือยัง
export const validateMonthlyLimit = async (
  userId: string,
  date: string,
  excludeBookingId?: string
): Promise<ValidationResult> => {
  const bookings = await getBookings();
  const bookingDate = new Date(date);
  const year = bookingDate.getFullYear();
  const month = bookingDate.getMonth();

  const userBookings = bookings.filter((b) => {
    if (b.userId !== userId) return false;
    if (excludeBookingId && b.id === excludeBookingId) return false;
    const bDate = new Date(b.date);
    return bDate.getFullYear() === year && bDate.getMonth() === month;
  });

  if (userBookings.length >= 1) {
    return {
      valid: false,
      error: "เดือนนี้คุณได้ขอลาแล้ว (1 เดือนสามารถขอลาได้เพียง 1 ครั้ง)",
    };
  }

  return { valid: true };
};

// ตรวจสอบว่าผ่านวันแล้วหรือยัง (สำหรับแก้ไข)
export const validateCanEdit = (bookingDate: string): ValidationResult => {
  const {
    getTodayBangkok,
    parseDateString,
    getStartOfDayBangkok,
  } = require("@/lib/dateUtils");
  const today = getTodayBangkok();
  const date = getStartOfDayBangkok(parseDateString(bookingDate));

  if (date < today) {
    return {
      valid: false,
      error: "ไม่สามารถแก้ไขการจองที่ผ่านวันไปแล้ว",
    };
  }

  return { valid: true };
};

// ตรวจสอบทุกอย่างรวมกัน
export const validateBooking = async (
  userId: string,
  startDate: string,
  endDate: string,
  category: LeaveCategory,
  excludeBookingId?: string
): Promise<ValidationResult> => {
  // ตรวจสอบจำนวนวันสูงสุด
  const maxDaysCheck = validateMaxDays(startDate, endDate, category);
  if (!maxDaysCheck.valid) return maxDaysCheck;

  // ตรวจสอบว่าทุกวันมีคนจองเกิน 2 คนหรือยัง
  const dates = getDatesInRange(startDate, endDate);
  for (const date of dates) {
    const capacityCheck = await validateDateCapacity(date, excludeBookingId);
    if (!capacityCheck.valid) {
      return {
        valid: false,
        error: `วันที่ ${date} ${capacityCheck.error}`,
      };
    }
  }

  // ตรวจสอบว่าลาหลายเดือนเกิน 1 ครั้งหรือยัง
  const monthlyCheck = await validateMonthlyLimit(
    userId,
    startDate,
    excludeBookingId
  );
  if (!monthlyCheck.valid) return monthlyCheck;

  return { valid: true };
};
