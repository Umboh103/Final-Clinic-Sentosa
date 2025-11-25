export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          date: string | null
          doctor_id: string | null
          id: string
          patient_id: string
          queue_number: number | null
          status: Database["public"]["Enums"]["appointment_status"] | null
          symptoms: string | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          doctor_id?: string | null
          id?: string
          patient_id: string
          queue_number?: number | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          symptoms?: string | null
        }
        Update: {
          created_at?: string
          date?: string | null
          doctor_id?: string | null
          id?: string
          patient_id?: string
          queue_number?: number | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          symptoms?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          appointment_id: string
          created_at: string
          diagnosis: string | null
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          diagnosis?: string | null
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medicines: {
        Row: {
          created_at: string
          id: string
          name: string
          price: number | null
          stock: number | null
          unit: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price?: number | null
          stock?: number | null
          unit?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price?: number | null
          stock?: number | null
          unit?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string
          gender: string | null
          id: string
          nik: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name: string
          gender?: string | null
          id?: string
          nik: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          nik?: string
          phone?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string
          created_at: string
          id: string
          method: Database["public"]["Enums"]["payment_method"] | null
          status: Database["public"]["Enums"]["payment_status"] | null
        }
        Insert: {
          amount: number
          appointment_id: string
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"] | null
          status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Update: {
          amount?: number
          appointment_id?: string
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"] | null
          status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_items: {
        Row: {
          created_at: string
          id: string
          instructions: string | null
          medicine_id: string
          prescription_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          instructions?: string | null
          medicine_id: string
          prescription_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          instructions?: string | null
          medicine_id?: string
          prescription_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "prescription_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          medical_record_id: string
          status: Database["public"]["Enums"]["prescription_status"] | null
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          medical_record_id: string
          status?: Database["public"]["Enums"]["prescription_status"] | null
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          medical_record_id?: string
          status?: Database["public"]["Enums"]["prescription_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
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
      appointment_status: "waiting_doctor" | "in_examination" | "waiting_pharmacy" | "medicine_ready" | "completed" | "cancelled"
      payment_method: "cash" | "transfer"
      payment_status: "pending" | "paid"
      prescription_status: "pending" | "processed" | "completed"
      user_role: "admin" | "doctor" | "pharmacist" | "owner" | "patient"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
