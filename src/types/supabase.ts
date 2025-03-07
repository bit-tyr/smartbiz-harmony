export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accommodations: {
        Row: {
          address: string
          check_in_date: string
          check_out_date: string
          created_at: string
          currency: string
          daily_rate: number
          hotel_name: string
          id: string
          observations: string | null
          room_number: string | null
          total_amount: number
          travel_request_id: string
          updated_at: string
        }
        Insert: {
          address: string
          check_in_date: string
          check_out_date: string
          created_at?: string
          currency?: string
          daily_rate: number
          hotel_name: string
          id?: string
          observations?: string | null
          room_number?: string | null
          total_amount: number
          travel_request_id: string
          updated_at?: string
        }
        Update: {
          address?: string
          check_in_date?: string
          check_out_date?: string
          created_at?: string
          currency?: string
          daily_rate?: number
          hotel_name?: string
          id?: string
          observations?: string | null
          room_number?: string | null
          total_amount?: number
          travel_request_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodations_travel_request_id_fkey"
            columns: ["travel_request_id"]
            isOneToOne: false
            referencedRelation: "travel_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["user_id"]
          },
        ]
      }
      budget_code_products: {
        Row: {
          budget_code_id: string
          created_at: string
          id: string
          product_id: string
        }
        Insert: {
          budget_code_id: string
          created_at?: string
          id?: string
          product_id: string
        }
        Update: {
          budget_code_id?: string
          created_at?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_code_products_budget_code_id_fkey"
            columns: ["budget_code_id"]
            isOneToOne: false
            referencedRelation: "budget_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_code_products_budget_code_id_fkey"
            columns: ["budget_code_id"]
            isOneToOne: false
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["budget_code_id"]
          },
          {
            foreignKeyName: "budget_code_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_codes: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["user_id"]
          },
        ]
      }
      daily_expenses: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string
          expense_date: string
          expense_type: string
          id: string
          observations: string | null
          travel_request_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description: string
          expense_date: string
          expense_type: string
          id?: string
          observations?: string | null
          travel_request_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string
          expense_date?: string
          expense_type?: string
          id?: string
          observations?: string | null
          travel_request_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_expenses_travel_request_id_fkey"
            columns: ["travel_request_id"]
            isOneToOne: false
            referencedRelation: "travel_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          purchase_request_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          purchase_request_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          purchase_request_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_purchase_request_id_fkey"
            columns: ["purchase_request_id"]
            isOneToOne: false
            referencedRelation: "purchase_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          file_path: string
          id: string
          invoice_date: string
          role_id: string
          status: string | null
          supplier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          file_path: string
          id?: string
          invoice_date: string
          role_id: string
          status?: string | null
          supplier: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          file_path?: string
          id?: string
          invoice_date?: string
          role_id?: string
          status?: string | null
          supplier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["user_id"]
          },
        ]
      }
      laboratories: {
        Row: {
          budget_code_id: string | null
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          budget_code_id?: string | null
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          budget_code_id?: string | null
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "laboratories_budget_code_id_fkey"
            columns: ["budget_code_id"]
            isOneToOne: false
            referencedRelation: "budget_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "laboratories_budget_code_id_fkey"
            columns: ["budget_code_id"]
            isOneToOne: false
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["budget_code_id"]
          },
        ]
      }
      laboratory_budget_codes: {
        Row: {
          budget_code_id: string
          created_at: string
          laboratory_id: string
        }
        Insert: {
          budget_code_id: string
          created_at?: string
          laboratory_id: string
        }
        Update: {
          budget_code_id?: string
          created_at?: string
          laboratory_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "laboratory_budget_codes_budget_code_id_fkey"
            columns: ["budget_code_id"]
            isOneToOne: false
            referencedRelation: "budget_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "laboratory_budget_codes_budget_code_id_fkey"
            columns: ["budget_code_id"]
            isOneToOne: false
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["budget_code_id"]
          },
          {
            foreignKeyName: "laboratory_budget_codes_laboratory_id_fkey"
            columns: ["laboratory_id"]
            isOneToOne: false
            referencedRelation: "laboratories"
            referencedColumns: ["id"]
          },
        ]
      }
      laboratory_users: {
        Row: {
          created_at: string
          laboratory_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          laboratory_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          laboratory_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "laboratory_users_laboratory_id_fkey"
            columns: ["laboratory_id"]
            isOneToOne: false
            referencedRelation: "laboratories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "laboratory_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          purchase_request_id: string | null
          read: boolean | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          purchase_request_id?: string | null
          read?: boolean | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          purchase_request_id?: string | null
          read?: boolean | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_purchase_request_id_fkey"
            columns: ["purchase_request_id"]
            isOneToOne: false
            referencedRelation: "purchase_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["user_id"]
          },
        ]
      }
      product_budget_codes: {
        Row: {
          budget_code_id: string
          created_at: string
          id: string
          product_id: string
          updated_at: string
        }
        Insert: {
          budget_code_id: string
          created_at?: string
          id?: string
          product_id: string
          updated_at?: string
        }
        Update: {
          budget_code_id?: string
          created_at?: string
          id?: string
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_budget_codes_budget_code_id_fkey"
            columns: ["budget_code_id"]
            isOneToOne: false
            referencedRelation: "budget_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_budget_codes_budget_code_id_fkey"
            columns: ["budget_code_id"]
            isOneToOne: false
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["budget_code_id"]
          },
          {
            foreignKeyName: "product_budget_codes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          default_group_id: string | null
          email: string | null
          first_name: string | null
          id: string
          is_admin: boolean | null
          is_blocked: boolean | null
          laboratory_id: string | null
          last_name: string | null
          role_id: string
          updated_at: string
          user_id: string | null
          username: string | null
        }
        Insert: {
          created_at?: string
          default_group_id?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          is_admin?: boolean | null
          is_blocked?: boolean | null
          laboratory_id?: string | null
          last_name?: string | null
          role_id: string
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string
          default_group_id?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_blocked?: boolean | null
          laboratory_id?: string | null
          last_name?: string | null
          role_id?: string
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_group_id_fkey"
            columns: ["default_group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_laboratory_id_fkey"
            columns: ["laboratory_id"]
            isOneToOne: false
            referencedRelation: "laboratories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["user_id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          laboratory_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          laboratory_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          laboratory_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_laboratory_id_fkey"
            columns: ["laboratory_id"]
            isOneToOne: false
            referencedRelation: "laboratories"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_request_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          purchase_request_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          purchase_request_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          purchase_request_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_request_attachments_purchase_request_id_fkey"
            columns: ["purchase_request_id"]
            isOneToOne: false
            referencedRelation: "purchase_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_request_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          purchase_request_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          purchase_request_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          purchase_request_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_request_comments_purchase_request_id_fkey"
            columns: ["purchase_request_id"]
            isOneToOne: false
            referencedRelation: "purchase_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_request_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["user_id"]
          },
        ]
      }
      purchase_request_items: {
        Row: {
          created_at: string
          currency: string | null
          id: string
          product_id: string
          purchase_request_id: string
          quantity: number
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          id?: string
          product_id: string
          purchase_request_id: string
          quantity: number
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          id?: string
          product_id?: string
          purchase_request_id?: string
          quantity?: number
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_request_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_request_items_purchase_request_id_fkey"
            columns: ["purchase_request_id"]
            isOneToOne: false
            referencedRelation: "purchase_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_requests: {
        Row: {
          actions: string | null
          allowance_amount: number | null
          attachments: string[] | null
          budget_code_id: string | null
          check_in: string | null
          check_out: string | null
          created_at: string
          creator_id: string | null
          deleted_at: string | null
          departure_date: string | null
          emergency_contact: string | null
          first_name: string | null
          hotel_name: string | null
          id: string
          laboratory_id: string | null
          last_name: string | null
          needs_insurance: boolean | null
          needs_passage: boolean | null
          number: number
          number_of_days: number | null
          observations: string | null
          preferred_schedule: string | null
          requires_allowance: boolean | null
          return_date: string | null
          status: string | null
          travel_destination: string | null
          travel_purpose: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: string | null
          allowance_amount?: number | null
          attachments?: string[] | null
          budget_code_id?: string | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          creator_id?: string | null
          deleted_at?: string | null
          departure_date?: string | null
          emergency_contact?: string | null
          first_name?: string | null
          hotel_name?: string | null
          id?: string
          laboratory_id?: string | null
          last_name?: string | null
          needs_insurance?: boolean | null
          needs_passage?: boolean | null
          number?: number
          number_of_days?: number | null
          observations?: string | null
          preferred_schedule?: string | null
          requires_allowance?: boolean | null
          return_date?: string | null
          status?: string | null
          travel_destination?: string | null
          travel_purpose?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: string | null
          allowance_amount?: number | null
          attachments?: string[] | null
          budget_code_id?: string | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          creator_id?: string | null
          deleted_at?: string | null
          departure_date?: string | null
          emergency_contact?: string | null
          first_name?: string | null
          hotel_name?: string | null
          id?: string
          laboratory_id?: string | null
          last_name?: string | null
          needs_insurance?: boolean | null
          needs_passage?: boolean | null
          number?: number
          number_of_days?: number | null
          observations?: string | null
          preferred_schedule?: string | null
          requires_allowance?: boolean | null
          return_date?: string | null
          status?: string | null
          travel_destination?: string | null
          travel_purpose?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requests_budget_code_id_fkey"
            columns: ["budget_code_id"]
            isOneToOne: false
            referencedRelation: "budget_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requests_budget_code_id_fkey"
            columns: ["budget_code_id"]
            isOneToOne: false
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["budget_code_id"]
          },
          {
            foreignKeyName: "purchase_requests_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requests_laboratory_id_fkey"
            columns: ["laboratory_id"]
            isOneToOne: false
            referencedRelation: "laboratories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["user_id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          ruc: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          ruc?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          ruc?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transportation: {
        Row: {
          amount: number
          arrival_date: string
          arrival_location: string
          baggage_details: string | null
          created_at: string
          currency: string
          departure_date: string
          departure_location: string
          id: string
          observations: string | null
          ticket_number: string | null
          transport_type: string
          travel_class: string | null
          travel_request_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          arrival_date: string
          arrival_location: string
          baggage_details?: string | null
          created_at?: string
          currency?: string
          departure_date: string
          departure_location: string
          id?: string
          observations?: string | null
          ticket_number?: string | null
          transport_type: string
          travel_class?: string | null
          travel_request_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          arrival_date?: string
          arrival_location?: string
          baggage_details?: string | null
          created_at?: string
          currency?: string
          departure_date?: string
          departure_location?: string
          id?: string
          observations?: string | null
          ticket_number?: string | null
          transport_type?: string
          travel_class?: string | null
          travel_request_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transportation_travel_request_id_fkey"
            columns: ["travel_request_id"]
            isOneToOne: false
            referencedRelation: "travel_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_attachments: {
        Row: {
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          travel_request_id: string
          uploaded_at: string
        }
        Insert: {
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          travel_request_id: string
          uploaded_at?: string
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          travel_request_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_attachments_travel_request_id_fkey"
            columns: ["travel_request_id"]
            isOneToOne: false
            referencedRelation: "travel_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_expenses: {
        Row: {
          created_at: string
          currency: string
          description: string
          estimated_amount: number
          expense_type: Database["public"]["Enums"]["travel_expense_type"]
          id: string
          receipt_path: string | null
          status: string | null
          travel_request_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description: string
          estimated_amount: number
          expense_type: Database["public"]["Enums"]["travel_expense_type"]
          id?: string
          receipt_path?: string | null
          status?: string | null
          travel_request_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string
          estimated_amount?: number
          expense_type?: Database["public"]["Enums"]["travel_expense_type"]
          id?: string
          receipt_path?: string | null
          status?: string | null
          travel_request_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_expenses_travel_request_id_fkey"
            columns: ["travel_request_id"]
            isOneToOne: false
            referencedRelation: "travel_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_policies: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          expense_type: string
          id: string
          max_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          expense_type: string
          id?: string
          max_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          expense_type?: string
          id?: string
          max_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      travel_requests: {
        Row: {
          additional_observations: string | null
          allowance_amount: number | null
          bank: string | null
          birth_date: string | null
          budget_code_id: string | null
          check_in: string | null
          check_out: string | null
          created_at: string
          created_by: string | null
          currency: string
          departure_date: string
          destination: string
          document_expiry: string | null
          document_number: string | null
          email: string | null
          emergency_contact: string | null
          finance_approver_id: string | null
          finance_notes: string | null
          first_name: string | null
          id: string
          insurance_period: string | null
          laboratory_id: string
          last_name: string | null
          manager_id: string | null
          manager_notes: string | null
          needs_insurance: boolean | null
          needs_passage: boolean | null
          number_of_days: number | null
          phone: string | null
          preferred_schedule: string | null
          project_id: string | null
          purpose: string
          requires_allowance: boolean | null
          return_date: string
          second_last_name: string | null
          status: Database["public"]["Enums"]["travel_request_status"] | null
          total_estimated_budget: number
          travel_purpose: string | null
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          additional_observations?: string | null
          allowance_amount?: number | null
          bank?: string | null
          birth_date?: string | null
          budget_code_id?: string | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          departure_date: string
          destination: string
          document_expiry?: string | null
          document_number?: string | null
          email?: string | null
          emergency_contact?: string | null
          finance_approver_id?: string | null
          finance_notes?: string | null
          first_name?: string | null
          id?: string
          insurance_period?: string | null
          laboratory_id: string
          last_name?: string | null
          manager_id?: string | null
          manager_notes?: string | null
          needs_insurance?: boolean | null
          needs_passage?: boolean | null
          number_of_days?: number | null
          phone?: string | null
          preferred_schedule?: string | null
          project_id?: string | null
          purpose: string
          requires_allowance?: boolean | null
          return_date: string
          second_last_name?: string | null
          status?: Database["public"]["Enums"]["travel_request_status"] | null
          total_estimated_budget: number
          travel_purpose?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          additional_observations?: string | null
          allowance_amount?: number | null
          bank?: string | null
          birth_date?: string | null
          budget_code_id?: string | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          departure_date?: string
          destination?: string
          document_expiry?: string | null
          document_number?: string | null
          email?: string | null
          emergency_contact?: string | null
          finance_approver_id?: string | null
          finance_notes?: string | null
          first_name?: string | null
          id?: string
          insurance_period?: string | null
          laboratory_id?: string
          last_name?: string | null
          manager_id?: string | null
          manager_notes?: string | null
          needs_insurance?: boolean | null
          needs_passage?: boolean | null
          number_of_days?: number | null
          phone?: string | null
          preferred_schedule?: string | null
          project_id?: string | null
          purpose?: string
          requires_allowance?: boolean | null
          return_date?: string
          second_last_name?: string | null
          status?: Database["public"]["Enums"]["travel_request_status"] | null
          total_estimated_budget?: number
          travel_purpose?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_requests_budget_code_id_fkey"
            columns: ["budget_code_id"]
            isOneToOne: false
            referencedRelation: "budget_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_requests_budget_code_id_fkey"
            columns: ["budget_code_id"]
            isOneToOne: false
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["budget_code_id"]
          },
          {
            foreignKeyName: "travel_requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "travel_requests_finance_approver_id_fkey"
            columns: ["finance_approver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_requests_laboratory_id_fkey"
            columns: ["laboratory_id"]
            isOneToOne: false
            referencedRelation: "laboratories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_requests_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_requests_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "travel_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_groups: {
        Row: {
          created_at: string
          group_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_groups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      budget_code_products_mv: {
        Row: {
          budget_code_id: string | null
          product_ids: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_code_products_budget_code_id_fkey"
            columns: ["budget_code_id"]
            isOneToOne: false
            referencedRelation: "budget_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_code_products_budget_code_id_fkey"
            columns: ["budget_code_id"]
            isOneToOne: false
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["budget_code_id"]
          },
        ]
      }
      budget_code_products_view: {
        Row: {
          budget_code_id: string | null
          created_at: string | null
          id: string | null
          product_id: string | null
        }
        Insert: {
          budget_code_id?: string | null
          created_at?: string | null
          id?: string | null
          product_id?: string | null
        }
        Update: {
          budget_code_id?: string | null
          created_at?: string | null
          id?: string | null
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_code_products_budget_code_id_fkey"
            columns: ["budget_code_id"]
            isOneToOne: false
            referencedRelation: "budget_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_code_products_budget_code_id_fkey"
            columns: ["budget_code_id"]
            isOneToOne: false
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["budget_code_id"]
          },
          {
            foreignKeyName: "budget_code_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_laboratory_budget_codes: {
        Row: {
          budget_code_id: string | null
          code: string | null
          description: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_travel_request: {
        Args: {
          request_id: string
          approver_id: string
          notes?: string
        }
        Returns: {
          additional_observations: string | null
          allowance_amount: number | null
          bank: string | null
          birth_date: string | null
          budget_code_id: string | null
          check_in: string | null
          check_out: string | null
          created_at: string
          created_by: string | null
          currency: string
          departure_date: string
          destination: string
          document_expiry: string | null
          document_number: string | null
          email: string | null
          emergency_contact: string | null
          finance_approver_id: string | null
          finance_notes: string | null
          first_name: string | null
          id: string
          insurance_period: string | null
          laboratory_id: string
          last_name: string | null
          manager_id: string | null
          manager_notes: string | null
          needs_insurance: boolean | null
          needs_passage: boolean | null
          number_of_days: number | null
          phone: string | null
          preferred_schedule: string | null
          project_id: string | null
          purpose: string
          requires_allowance: boolean | null
          return_date: string
          second_last_name: string | null
          status: Database["public"]["Enums"]["travel_request_status"] | null
          total_estimated_budget: number
          travel_purpose: string | null
          updated_at: string
          updated_by: string | null
          user_id: string
        }
      }
      delete_user: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      get_budget_code_product_list: {
        Args: {
          p_budget_code_id: string
        }
        Returns: string[]
      }
      get_budget_code_products: {
        Args: {
          p_budget_code_id: string
        }
        Returns: {
          product_id: string
        }[]
      }
      get_supplier_products: {
        Args: {
          p_supplier_id: string
        }
        Returns: {
          id: string
          name: string
          code: string
          description: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_budget_code_products: {
        Args: {
          p_budget_code_id: string
          p_product_ids: string[]
        }
        Returns: undefined
      }
      update_product_supplier: {
        Args: {
          p_product_id: string
          p_supplier_id: string
        }
        Returns: undefined
      }
      update_purchase_request_status:
        | {
            Args: {
              request_id: number
              new_status: string
            }
            Returns: undefined
          }
        | {
            Args: {
              request_id: string
              new_status: string
            }
            Returns: Json
          }
      update_purchase_request_status_json: {
        Args: {
          request_id: string
          new_status: string
        }
        Returns: Json
      }
      update_supplier_products: {
        Args: {
          p_supplier_id: string
          p_product_ids: string[]
        }
        Returns: undefined
      }
      update_user_role: {
        Args: {
          target_user_id: string
          new_role: string
        }
        Returns: undefined
      }
    }
    Enums: {
      travel_expense_type:
        | "pasaje_aereo"
        | "alojamiento"
        | "viaticos"
        | "transporte_local"
        | "otros"
      travel_request_status:
        | "pendiente"
        | "en_proceso"
        | "aprobado"
        | "denegado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
