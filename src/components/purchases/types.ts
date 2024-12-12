export interface PurchaseRequest {
  id: string;
  number: number;
  status: string;
  created_at: string;
  laboratory: { name: string } | null;
  budget_code: { code: string; description: string } | null;
  observations: string | null;
  purchase_request_items?: {
    quantity: number;
    unit_price: number | null;
    currency: string | null;
    product: {
      name: string;
      supplier: { name: string };
    } | null;
  }[];
}