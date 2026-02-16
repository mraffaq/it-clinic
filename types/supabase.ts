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
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
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
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          duration_minutes: number | null
          icon: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          duration_minutes?: number | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          duration_minutes?: number | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          stock: number
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          stock?: number
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          stock?: number
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          id: string
          user_id: string
          service_id: string
          booking_date: string
          booking_time: string | null
          problem_description: string | null
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          repair_status: 'registered' | 'received' | 'diagnosing' | 'repairing' | 'ready' | 'picked_up' | 'cancelled'
          device_info: string | null
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service_id: string
          booking_date: string
          booking_time?: string | null
          problem_description?: string | null
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          repair_status?: 'registered' | 'received' | 'diagnosing' | 'repairing' | 'ready' | 'picked_up' | 'cancelled'
          device_info?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service_id?: string
          booking_date?: string
          booking_time?: string | null
          problem_description?: string | null
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          repair_status?: 'registered' | 'received' | 'diagnosing' | 'repairing' | 'ready' | 'picked_up' | 'cancelled'
          device_info?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      consultations: {
        Row: {
          id: string
          user_id: string | null
          name: string
          email: string
          phone: string | null
          subject: string | null
          message: string
          status: 'new' | 'in_progress' | 'resolved'
          admin_response: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          email: string
          phone?: string | null
          subject?: string | null
          message: string
          status?: 'new' | 'in_progress' | 'resolved'
          admin_response?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          email?: string
          phone?: string | null
          subject?: string | null
          message?: string
          status?: 'new' | 'in_progress' | 'resolved'
          admin_response?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      update_updated_at_column: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Profile = Tables<'profiles'>
export type Service = Tables<'services'>
export type Product = Tables<'products'>
export type Reservation = Tables<'reservations'>
export type Consultation = Tables<'consultations'>
