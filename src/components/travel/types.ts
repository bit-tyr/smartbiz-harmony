export interface TravelRequest {
  id: string;
  user_id: string;
  laboratory_id: string;
  project_id?: string;
  destination: string;
  departure_date: string;
  return_date: string;
  purpose: string;
  total_estimated_budget: number;
  currency: string;
  manager_id?: string;
  manager_notes?: string;
  finance_approver_id?: string;
  finance_notes?: string;
  created_at: string;
  updated_at: string;
  budget_code_id?: string;
  created_by?: string;
  updated_by?: string;
  first_name?: string;
  last_name?: string;
  second_last_name?: string;
  document_number?: string;
  birth_date?: string; // Changed from Date to string to match DB
  document_expiry?: string;
  phone?: string;
  email?: string;
  travel_purpose?: string;
  needs_passage?: boolean;
  needs_insurance?: boolean;
  insurance_period?: string;
  emergency_contact?: string;
  additional_observations?: string;
  preferred_schedule?: string;
  requires_allowance?: boolean;
  allowance_amount?: number;
  bank?: string;
  account_number?: string;
  account_holder?: string;
  hotel_name?: string;
  check_in?: string;
  check_out?: string;
  number_of_days?: number;
  status?: string;
}