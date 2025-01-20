export type Database = {
  public: {
    Tables: {
      budget_codes: {
        Row: {
          id: string
          code: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          code: string
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          code?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      budget_code_products: {
        Row: {
          budget_code_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          budget_code_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          budget_code_id?: string
          product_id?: string
          created_at?: string
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
            foreignKeyName: "budget_code_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string;
          name: string;
          code: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
          supplier_id: string | null;
        };
        Insert: {
          name: string;
          code?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          supplier_id?: string | null;
        };
        Update: {
          name?: string;
          code?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          supplier_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          }
        ];
      }
      // ... existing code ...
    }
    Functions: {
      get_budget_code_products: {
        Args: {
          p_budget_code_id: string
        }
        Returns: string[]
      }
      get_budget_code_product_list: {
        Args: {
          p_budget_code_id: string
        }
        Returns: string[]
      }
      update_budget_code_products: {
        Args: {
          p_budget_code_id: string
          p_product_ids: string[]
        }
        Returns: void
      }
    }
    Views: {
      budget_code_products_mv: {
        Row: {
          budget_code_id: string
          product_ids: string[]
        }
      }
    }
    // ... existing code ...
  }
}
