import { HistoryEntry, Booking } from "@/types/booking";
import { supabase } from "@/lib/supabase";

// ดึงประวัติทั้งหมด
export const getHistory = async (): Promise<HistoryEntry[]> => {
  try {
    const { data, error } = await supabase
      .from("booking_history")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Failed to get history:", error);
      return [];
    }

    return (
      data?.map((row) => ({
        id: row.id,
        action: row.action,
        bookingId: row.booking_id,
        userId: row.user_id,
        userName: row.user_name,
        timestamp: row.timestamp,
        oldData: row.old_data as Partial<Booking> | undefined,
        newData: row.new_data as Partial<Booking> | undefined,
        bookingData: row.booking_data as Partial<Booking> | undefined,
      })) || []
    );
  } catch (error) {
    console.error("Failed to get history:", error);
    return [];
  }
};

// บันทึกประวัติใหม่
export const addHistoryEntry = async (
  entry: Omit<HistoryEntry, "id" | "timestamp">
): Promise<HistoryEntry> => {
  try {
    const { data, error } = await supabase
      .from("booking_history")
      .insert({
        action: entry.action,
        booking_id: entry.bookingId,
        user_id: entry.userId,
        user_name: entry.userName,
        old_data: entry.oldData || null,
        new_data: entry.newData || null,
        booking_data: entry.bookingData || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to save history:", error);
      throw error;
    }

    return {
      id: data.id,
      action: data.action,
      bookingId: data.booking_id,
      userId: data.user_id,
      userName: data.user_name,
      timestamp: data.timestamp,
      oldData: data.old_data as Partial<Booking> | undefined,
      newData: data.new_data as Partial<Booking> | undefined,
      bookingData: data.booking_data as Partial<Booking> | undefined,
    };
  } catch (error) {
    console.error("Failed to add history entry:", error);
    throw error;
  }
};

// บันทึกประวัติการสร้าง
export const logCreate = async (booking: Booking): Promise<void> => {
  try {
    await addHistoryEntry({
      action: "create",
      bookingId: booking.id,
      userId: booking.userId,
      userName: booking.userName,
      bookingData: {
        date: booking.date,
        endDate: booking.endDate,
        category: booking.category,
        reason: booking.reason,
      },
    });
  } catch (error) {
    console.error("Failed to log create:", error);
  }
};

// บันทึกประวัติการแก้ไข
export const logUpdate = async (
  bookingId: string,
  userId: string,
  userName: string,
  oldData: Partial<Booking>,
  newData: Partial<Booking>
): Promise<void> => {
  try {
    await addHistoryEntry({
      action: "update",
      bookingId,
      userId,
      userName,
      oldData,
      newData,
    });
  } catch (error) {
    console.error("Failed to log update:", error);
  }
};

// บันทึกประวัติการลบ
export const logDelete = async (
  bookingId: string,
  userId: string,
  userName: string,
  bookingData: Partial<Booking>
): Promise<void> => {
  try {
    await addHistoryEntry({
      action: "delete",
      bookingId,
      userId,
      userName,
      oldData: bookingData,
    });
  } catch (error) {
    console.error("Failed to log delete:", error);
  }
};

// ดึงประวัติตาม bookingId
export const getHistoryByBookingId = async (
  bookingId: string
): Promise<HistoryEntry[]> => {
  try {
    const { data, error } = await supabase
      .from("booking_history")
      .select("*")
      .eq("booking_id", bookingId)
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Failed to get history by booking ID:", error);
      return [];
    }

    return (
      data?.map((row) => ({
        id: row.id,
        action: row.action,
        bookingId: row.booking_id,
        userId: row.user_id,
        userName: row.user_name,
        timestamp: row.timestamp,
        oldData: row.old_data as Partial<Booking> | undefined,
        newData: row.new_data as Partial<Booking> | undefined,
        bookingData: row.booking_data as Partial<Booking> | undefined,
      })) || []
    );
  } catch (error) {
    console.error("Failed to get history by booking ID:", error);
    return [];
  }
};

// ดึงประวัติตาม userId
export const getHistoryByUserId = async (
  userId: string
): Promise<HistoryEntry[]> => {
  try {
    const { data, error } = await supabase
      .from("booking_history")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Failed to get history by user ID:", error);
      return [];
    }

    return (
      data?.map((row) => ({
        id: row.id,
        action: row.action,
        bookingId: row.booking_id,
        userId: row.user_id,
        userName: row.user_name,
        timestamp: row.timestamp,
        oldData: row.old_data as Partial<Booking> | undefined,
        newData: row.new_data as Partial<Booking> | undefined,
        bookingData: row.booking_data as Partial<Booking> | undefined,
      })) || []
    );
  } catch (error) {
    console.error("Failed to get history by user ID:", error);
    return [];
  }
};

// ดึงประวัติทั้งหมด (เรียงตามเวลาใหม่สุดก่อน)
export const getAllHistory = async (
  limit?: number
): Promise<HistoryEntry[]> => {
  try {
    let query = supabase
      .from("booking_history")
      .select("*")
      .order("timestamp", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to get all history:", error);
      return [];
    }

    return (
      data?.map((row) => ({
        id: row.id,
        action: row.action,
        bookingId: row.booking_id,
        userId: row.user_id,
        userName: row.user_name,
        timestamp: row.timestamp,
        oldData: row.old_data as Partial<Booking> | undefined,
        newData: row.new_data as Partial<Booking> | undefined,
        bookingData: row.booking_data as Partial<Booking> | undefined,
      })) || []
    );
  } catch (error) {
    console.error("Failed to get all history:", error);
    return [];
  }
};

// ล้างประวัติทั้งหมด (สำหรับการทดสอบหรือ reset) - ควรระวังการใช้งาน
export const clearHistory = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from("booking_history")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      console.error("Failed to clear history:", error);
      throw error;
    }
  } catch (error) {
    console.error("Failed to clear history:", error);
    throw error;
  }
};
