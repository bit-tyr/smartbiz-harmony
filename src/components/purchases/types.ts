export interface PurchaseRequest {
  id: string;
  number: number;
  status: string;
  created_at: string;
  laboratory: { 
    id: string;
    name: string;
  } | null;
  budget_code: { 
    id: string;
    code: string; 
    description: string;
  } | null;
  observations: string | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  user_id: string;
  purchase_request_items?: {
    id: string;
    quantity: number;
    unit_price: number | null;
    currency: string | null;
    product: {
      id: string;
      name: string;
      supplier: { 
        id: string;
        name: string;
      };
    } | null;
  }[];
}