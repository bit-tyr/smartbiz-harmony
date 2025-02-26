
import { Json } from "@/types/supabase";

export interface Laboratory {
  id: string;
  name: string;
  created_at: string;
  description: string | null;
}

export interface BudgetCode {
  id: string;
  code: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  is_admin: boolean;
  is_blocked: boolean;
  role_id: string;
  laboratory_id: string | null;
  roles?: {
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseRequestItem {
  id: string;
  quantity: number;
  unit_price: number;
  currency: string;
  product?: {
    id: string;
    name: string;
    supplier?: {
      id: string;
      name: string;
    };
  };
}

export interface PurchaseRequest {
  id: string;
  number: string | null;
  created_at: string | null;
  deleted_at?: string | null;
  user_id: string | null;
  laboratory_id: string | null;
  budget_code_id: string | null;
  observations: string | null;
  status: string | null;
  actions: Json | null;
  laboratory?: Laboratory | null;
  budget_code?: BudgetCode | null;
  profile?: Profile | null;
  purchase_request_items?: PurchaseRequestItem[];
  total_amount?: number | null;
}

export interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  purchase_request_id: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface FormData {
  laboratoryId: string;
  budgetCodeId: string;
  supplierId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  observations?: string;
}

export interface BudgetCodeWithLaboratory extends BudgetCode {
  laboratory_budget_codes: Array<{ laboratory_id: string }>;
}
