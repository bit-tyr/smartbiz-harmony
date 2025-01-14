export interface TravelRequest {
  id: string;
  status: TravelRequestStatus;
  laboratoryId: string;
  budgetCodeId: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  birthDate: string;
  documentExpiry: string;
  phone: string;
  email: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  travelPurpose: string;
  needsPassage: boolean;
  needsInsurance: boolean;
  emergencyContact: string;
  preferredSchedule: string;
  allowanceAmount: number;
  requiresAllowance: boolean;
  currency: string;
  bank: string;
  accountNumber: string;
  accountHolder: string;
  hotelName: string;
  checkIn: string | null;
  checkOut: string | null;
  numberOfDays: number;
  additional_observations?: string;
}

export type TravelRequestStatus = 'pendiente' | 'aprobado_por_gerente' | 'aprobado_por_finanzas' | 'rechazado' | 'completado';