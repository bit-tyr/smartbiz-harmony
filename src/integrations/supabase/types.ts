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
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
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
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          sender_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          sender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          sender_id?: string | null
          updated_at?: string | null
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
      laboratories: {
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
          created_at: string | null
          id: string
          message: string
          purchase_request_id: string | null
          read: boolean | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          purchase_request_id?: string | null
          read?: boolean | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          purchase_request_id?: string | null
          read?: boolean | null
          title?: string
          updated_at?: string | null
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
      products: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
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
          email: string | null
          first_name: string | null
          id: string
          is_admin: boolean | null
          is_blocked: boolean | null
          laboratory_id: string | null
          last_name: string | null
          role_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          is_admin?: boolean | null
          is_blocked?: boolean | null
          laboratory_id?: string | null
          last_name?: string | null
          role_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_blocked?: boolean | null
          laboratory_id?: string | null
          last_name?: string | null
          role_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_roles"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["user_id"]
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
        ]
      }
      purchase_request_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          purchase_request_id: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          purchase_request_id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          purchase_request_id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_request_attachments_purchase_request_id_fkey"
            columns: ["purchase_request_id"]
            isOneToOne: false
            referencedRelation: "purchase_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_request_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_request_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          purchase_request_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          purchase_request_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          purchase_request_id?: string | null
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_request_items: {
        Row: {
          created_at: string | null
          currency: string | null
          id: string
          product_id: string | null
          purchase_request_id: string | null
          quantity: number | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          id?: string
          product_id?: string | null
          purchase_request_id?: string | null
          quantity?: number | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          id?: string
          product_id?: string | null
          purchase_request_id?: string | null
          quantity?: number | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
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
          actions: Json | null
          budget_code_id: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          laboratory_id: string | null
          number: string | null
          observations: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actions?: Json | null
          budget_code_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          laboratory_id?: string | null
          number?: string | null
          observations?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actions?: Json | null
          budget_code_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          laboratory_id?: string | null
          number?: string | null
          observations?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
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
          code: string
          created_at: string
          description: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          ruc: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          ruc?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          ruc?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      travel_expenses: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          estimated_amount: number
          expense_type: string
          id: string
          receipt_path: string | null
          status: string | null
          travel_request_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          estimated_amount: number
          expense_type: string
          id?: string
          receipt_path?: string | null
          status?: string | null
          travel_request_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          estimated_amount?: number
          expense_type?: string
          id?: string
          receipt_path?: string | null
          status?: string | null
          travel_request_id?: string | null
          updated_at?: string | null
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
      travel_requests: {
        Row: {
          budget_code_id: string | null
          created_at: string | null
          description: string | null
          destination: string
          end_date: string
          id: string
          laboratory_id: string | null
          purpose: string
          start_date: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          budget_code_id?: string | null
          created_at?: string | null
          description?: string | null
          destination: string
          end_date: string
          id?: string
          laboratory_id?: string | null
          purpose: string
          start_date: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          budget_code_id?: string | null
          created_at?: string | null
          description?: string | null
          destination?: string
          end_date?: string
          id?: string
          laboratory_id?: string | null
          purpose?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
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
            foreignKeyName: "travel_requests_laboratory_id_fkey"
            columns: ["laboratory_id"]
            isOneToOne: false
            referencedRelation: "laboratories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_laboratories: {
        Row: {
          assigned_at: string | null
          is_primary: boolean | null
          laboratory_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          is_primary?: boolean | null
          laboratory_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          is_primary?: boolean | null
          laboratory_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_laboratories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_role_mapping: {
        Row: {
          assigned_at: string | null
          is_primary: boolean | null
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          is_primary?: boolean | null
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          is_primary?: boolean | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_role_mapping_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_login: string | null
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_login?: string | null
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_login?: string | null
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      profile_roles: {
        Row: {
          email: string | null
          first_name: string | null
          is_admin: boolean | null
          is_blocked: boolean | null
          laboratory_id: string | null
          last_name: string | null
          profile_id: string | null
          role_id: string | null
          role_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_roles"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "user_laboratory_budget_codes"
            referencedColumns: ["user_id"]
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
      get_user_role: {
        Args: {
          user_uuid: string
        }
        Returns: string
      }
      get_user_roles: {
        Args: {
          user_uuid: string
        }
        Returns: {
          role_name: string
        }[]
      }
      is_admin:
        | {
            Args: Record<PropertyKey, never>
            Returns: boolean
          }
        | {
            Args: {
              check_user_id: string
            }
            Returns: boolean
          }
      is_administrator: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_manager: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_purchases: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      list_existing_tables: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
        }[]
      }
      log_activity: {
        Args: {
          p_user_id: string
          p_action: string
          p_entity_type: string
          p_entity_id: string
          p_details?: Json
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: string
      }
      reset_and_update_roles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
      user_role: "administrador" | "compras" | "usuario"
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
