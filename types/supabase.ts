export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          date: string;
          end_date: string | null;
          user_id: string;
          user_name: string;
          category: "domestic" | "international";
          reason: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          date: string;
          end_date?: string | null;
          user_id: string;
          user_name: string;
          category: "domestic" | "international";
          reason?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          date?: string;
          end_date?: string | null;
          user_id?: string;
          user_name?: string;
          category?: "domestic" | "international";
          reason?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      booking_history: {
        Row: {
          id: string;
          action: "create" | "update" | "delete";
          booking_id: string;
          user_id: string;
          user_name: string;
          timestamp: string;
          old_data: Json | null;
          new_data: Json | null;
          booking_data: Json | null;
        };
        Insert: {
          id?: string;
          action: "create" | "update" | "delete";
          booking_id: string;
          user_id: string;
          user_name: string;
          timestamp?: string;
          old_data?: Json | null;
          new_data?: Json | null;
          booking_data?: Json | null;
        };
        Update: {
          id?: string;
          action?: "create" | "update" | "delete";
          booking_id?: string;
          user_id?: string;
          user_name?: string;
          timestamp?: string;
          old_data?: Json | null;
          new_data?: Json | null;
          booking_data?: Json | null;
        };
      };
    };
  };
}
