
export interface Laboratory {
  id: string;
  name: string;
}

export interface BudgetCode {
  id: string;
  code: string;
  description: string;
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
  };
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
  number: string;
  created_at: string;
  deleted_at?: string | null;
  creator_id?: string;
  user_id: string;
  laboratory_id: string;
  budget_code_id: string;
  observations: string;
  status: string;
  actions: string[];
  laboratory?: Laboratory;
  budget_code?: BudgetCode;
  profile?: Profile;
  purchase_request_items?: PurchaseRequestItem[];
  bank?: string;
  account_number?: string;
  account_holder?: string;
  total_amount?: number;
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
