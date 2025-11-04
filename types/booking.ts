export interface Booking {
  id: string;
  date: string; // YYYY-MM-DD format
  endDate?: string; // YYYY-MM-DD format สำหรับการลาหลายวัน
  userId: string;
  userName: string;
  category: LeaveCategory; // ในประเทศ/นอกประเทศ
  reason?: string;
  createdAt: string;
  updatedAt?: string;
}

export type LeaveCategory = "domestic" | "international"; // ในประเทศ / นอกประเทศ

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: Booking[];
}

export type HistoryAction = "create" | "update" | "delete";

export interface HistoryEntry {
  id: string;
  action: HistoryAction;
  bookingId: string;
  userId: string;
  userName: string;
  timestamp: string;
  // เก็บข้อมูลก่อนและหลังการเปลี่ยนแปลง (สำหรับ update และ delete)
  oldData?: Partial<Booking>;
  newData?: Partial<Booking>;
  // ข้อมูลการจองที่เกี่ยวข้อง (สำหรับ create)
  bookingData?: Partial<Booking>;
}
