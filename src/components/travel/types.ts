
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
  birth_date?: string;
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
  accountNumber?: string;
  accountHolder?: string;
  hotelName?: string;
  check_in?: string;
  check_out?: string;
  number_of_days?: number;
  status?: string;
  start_date: string;
  end_date: string;
  description?: string;
}

export interface TravelRequestFormData extends Omit<TravelRequest, 'id' | 'created_at' | 'updated_at'> {
  laboratoryId: string;
  budgetCodeId?: string;
  departureDate: Date;
  returnDate: Date;
  birthDate?: Date;
  documentExpiry?: Date;
  checkIn?: Date | null;
  checkOut?: Date | null;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  is_admin: boolean;
  is_blocked: boolean;
  role_id: string;
  laboratory_id: string | null;
  created_at: string;
  updated_at: string;
}
