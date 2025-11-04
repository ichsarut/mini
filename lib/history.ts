import { HistoryEntry, Booking } from "@/types/booking";

const STORAGE_KEY = "line_liff_booking_history";

// เก็บประวัติการเปลี่ยนแปลงใน localStorage
export const getHistory = (): HistoryEntry[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to get history:", error);
    return [];
  }
};

// บันทึกประวัติใหม่
export const addHistoryEntry = (entry: Omit<HistoryEntry, "id" | "timestamp">): HistoryEntry => {
  const history = getHistory();

  const newEntry: HistoryEntry = {
    ...entry,
    id: `history_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    timestamp: new Date().toISOString(),
  };

  history.push(newEntry);

  // เก็บประวัติล่าสุด 1000 รายการ (เพื่อป้องกัน localStorage เต็ม)
  const maxHistory = 1000;
  const trimmedHistory = history.slice(-maxHistory);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error("Failed to save history:", error);
    // ถ้า localStorage เต็ม ให้ลบประวัติเก่าออก
    if (error instanceof Error && error.name === "QuotaExceededError") {
      const reducedHistory = history.slice(-500); // ลดเหลือ 500 รายการ
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedHistory));
    }
    throw error;
  }

  return newEntry;
};

// บันทึกประวัติการสร้าง
export const logCreate = (booking: Booking): void => {
  addHistoryEntry({
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
};

// บันทึกประวัติการแก้ไข
export const logUpdate = (
  bookingId: string,
  userId: string,
  userName: string,
  oldData: Partial<Booking>,
  newData: Partial<Booking>
): void => {
  addHistoryEntry({
    action: "update",
    bookingId,
    userId,
    userName,
    oldData,
    newData,
  });
};

// บันทึกประวัติการลบ
export const logDelete = (
  bookingId: string,
  userId: string,
  userName: string,
  bookingData: Partial<Booking>
): void => {
  addHistoryEntry({
    action: "delete",
    bookingId,
    userId,
    userName,
    oldData: bookingData,
  });
};

// ดึงประวัติตาม bookingId
export const getHistoryByBookingId = (bookingId: string): HistoryEntry[] => {
  const history = getHistory();
  return history.filter((entry) => entry.bookingId === bookingId);
};

// ดึงประวัติตาม userId
export const getHistoryByUserId = (userId: string): HistoryEntry[] => {
  const history = getHistory();
  return history.filter((entry) => entry.userId === userId);
};

// ดึงประวัติทั้งหมด (เรียงตามเวลาใหม่สุดก่อน)
export const getAllHistory = (limit?: number): HistoryEntry[] => {
  const history = getHistory();
  const sorted = history.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
  return limit ? sorted.slice(0, limit) : sorted;
};

// ล้างประวัติทั้งหมด (สำหรับการทดสอบหรือ reset)
export const clearHistory = (): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear history:", error);
  }
};

