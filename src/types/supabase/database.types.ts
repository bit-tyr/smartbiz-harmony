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
      travel_requests: {
        Row: {
          id: string
          user_id: string
          laboratory_id: string
          project_id?: string
          destination: string
          departure_date: string
          return_date: string
          purpose: string
          status: 'pendiente' | 'aprobado_por_gerente' | 'aprobado_por_finanzas' | 'rechazado' | 'completado'
          total_estimated_budget: number
          currency: string
          manager_id?: string
          manager_notes?: string
          finance_approver_id?: string
          finance_notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          laboratory_id: string
          project_id?: string
          destination: string
          departure_date: string
          return_date: string
          purpose: string
          status?: 'pendiente' | 'aprobado_por_gerente' | 'aprobado_por_finanzas' | 'rechazado' | 'completado'
          total_estimated_budget: number
          currency?: string
          manager_id?: string
          manager_notes?: string
          finance_approver_id?: string
          finance_notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          laboratory_id?: string
          project_id?: string
          destination?: string
          departure_date?: string
          return_date?: string
          purpose?: string
          status?: 'pendiente' | 'aprobado_por_gerente' | 'aprobado_por_finanzas' | 'rechazado' | 'completado'
          total_estimated_budget?: number
          currency?: string
          manager_id?: string
          manager_notes?: string
          finance_approver_id?: string
          finance_notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_requests_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_requests_laboratory_id_fkey"
            columns: ["laboratory_id"]
            referencedRelation: "laboratories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_requests_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_requests_manager_id_fkey"
            columns: ["manager_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_requests_finance_approver_id_fkey"
            columns: ["finance_approver_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      travel_expenses: {
        Row: {
          id: string
          travel_request_id: string
          expense_type: 'pasaje_aereo' | 'alojamiento' | 'viaticos' | 'transporte_local' | 'otros'
          description: string
          estimated_amount: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          travel_request_id: string
          expense_type: 'pasaje_aereo' | 'alojamiento' | 'viaticos' | 'transporte_local' | 'otros'
          description: string
          estimated_amount: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          travel_request_id?: string
          expense_type?: 'pasaje_aereo' | 'alojamiento' | 'viaticos' | 'transporte_local' | 'otros'
          description?: string
          estimated_amount?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_expenses_travel_request_id_fkey"
            columns: ["travel_request_id"]
            referencedRelation: "travel_requests"
            referencedColumns: ["id"]
          }
        ]
      }
      travel_attachments: {
        Row: {
          id: string
          travel_request_id: string
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          uploaded_at: string
        }
        Insert: {
          id?: string
          travel_request_id: string
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          uploaded_at?: string
        }
        Update: {
          id?: string
          travel_request_id?: string
          file_name?: string
          file_path?: string
          file_type?: string
          file_size?: number
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_attachments_travel_request_id_fkey"
            columns: ["travel_request_id"]
            referencedRelation: "travel_requests"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          id: string
          name: string
          description?: string
          laboratory_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          laboratory_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          laboratory_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_laboratory_id_fkey"
            columns: ["laboratory_id"]
            referencedRelation: "laboratories"
            referencedColumns: ["id"]
          }
        ]
      }
      // ... resto de las tablas existentes ...
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_travel_request: {
        Args: {
          request_id: string
          approver_id: string
          notes?: string
        }
        Returns: Database['public']['Tables']['travel_requests']['Row']
      }
    }
    Enums: {
      travel_request_status: 'pendiente' | 'aprobado_por_gerente' | 'aprobado_por_finanzas' | 'rechazado' | 'completado'
      travel_expense_type: 'pasaje_aereo' | 'alojamiento' | 'viaticos' | 'transporte_local' | 'otros'
    }
  }
} 