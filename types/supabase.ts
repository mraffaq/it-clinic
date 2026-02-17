export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: "user" | "admin" | "technician"
          created_at: string
          updated_at: string
          email: string
          phone: string | null
          address: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: "user" | "admin" | "technician"
          created_at?: string
          updated_at?: string
          email: string
          phone?: string | null
          address?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: "user" | "admin" | "technician"
          created_at?: string
          updated_at?: string
          email?: string
          phone?: string | null
          address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reservations: {
        Row: {
          id: string
          user_id: string
          device_type: string
          device_model: string
          issue_description: string
          status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"
          repair_status: "pending" | "diagnosing" | "repairing" | "completed" | "cancelled" | "ready" | "registered" | "received" | "picked_up" | null
          reservation_date: string
          booking_date: string | null
          booking_time: string | null
          problem_description: string | null
          device_info: string | null
          service_id: string | null
          admin_notes: string | null
          service: { name: string; price: number } | null
          user: { full_name: string | null; email: string } | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          device_type?: string
          device_model?: string
          issue_description?: string
          status?: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"
          repair_status?: "pending" | "diagnosing" | "repairing" | "completed" | "cancelled" | "ready" | "registered" | "received" | "picked_up" | null
          reservation_date?: string
          booking_date?: string | null
          booking_time?: string | null
          problem_description?: string | null
          device_info?: string | null
          service_id?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          device_type?: string
          device_model?: string
          issue_description?: string
          status?: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"
          repair_status?: "pending" | "diagnosing" | "repairing" | "completed" | "cancelled" | "ready" | "registered" | "received" | "picked_up" | null
          reservation_date?: string
          booking_date?: string | null
          booking_time?: string | null
          problem_description?: string | null
          device_info?: string | null
          service_id?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      testimonials: {
        Row: {
          id: string
          name: string
          role: string
          content: string
          rating: number
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          role: string
          content: string
          rating: number
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
          content?: string
          rating?: number
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          created_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          stock: number
          category: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          stock: number
          category: string
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          stock?: number
          category?: string
          image_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          message?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]

export type Profile = Tables<"profiles">
export type Reservation = Tables<"reservations">
export type Testimonial = Tables<"testimonials">
export type Service = Tables<"services">
export type Product = Tables<"products">
export type Consultation = Tables<"consultations">
