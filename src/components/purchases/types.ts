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
  first_name: string;
  last_name: string;
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
  number: number;
  created_at: string;
  deleted_at?: string | null;
  creator_id: string;
  user_id: string;
  laboratory_id: string;
  budget_code_id: string;
  observations: string;
  status: string;
  actions: string;
  laboratory?: Laboratory;
  budget_code?: BudgetCode;
  profiles?: Profile;
  purchase_request_items?: PurchaseRequestItem[];
}