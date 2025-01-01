export type TravelExpenseType = 'pasaje_aereo' | 'alojamiento' | 'viaticos' | 'transporte_local' | 'otros';

export type TravelRequestStatus = 'pendiente' | 'aprobado_por_gerente' | 'aprobado_por_finanzas' | 'rechazado' | 'completado';

export interface TravelRequest {
  id: string;
  user_id: string;
  laboratory_id: string;
  project_id?: string;
  destination: string;
  departure_date: string;
  return_date: string;
  purpose: string;
  status: TravelRequestStatus;
  total_estimated_budget: number;
  currency: string;
  manager_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TravelExpense {
  id: string;
  travel_request_id: string;
  expense_type: TravelExpenseType;
  description: string;
  estimated_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface TravelAttachment {
  id: string;
  travel_request_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface TravelRequestFormValues {
  laboratory_id: string;
  project_id?: string;
  destination: string;
  departure_date: Date;
  return_date: Date;
  purpose: string;
  expenses: {
    expense_type: TravelExpenseType;
    description: string;
    estimated_amount: number;
    currency: string;
  }[];
  files?: File[];
}

export interface TravelRequestWithDetails extends TravelRequest {
  laboratory: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
  } | null;
  expenses: TravelExpense[];
  attachments: TravelAttachment[];
  requester: {
    id: string;
    email: string;
  };
  manager?: {
    id: string;
    email: string;
  };
  finance_approver?: {
    id: string;
    email: string;
  };
} 