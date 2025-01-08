import { z } from "zod";

export const travelRequestSchema = z.object({
  laboratoryId: z.string().min(1, "El laboratorio es requerido"),
  budgetCodeId: z.string().min(1, "El código presupuestal es requerido"),
  firstName: z.string().min(1, "El primer nombre es requerido"),
  secondName: z.string().optional(),
  lastName: z.string().min(1, "El primer apellido es requerido"),
  secondLastName: z.string().optional(),
  documentNumber: z.string().min(1, "El número de documento es requerido"),
  birthDate: z.date({
    required_error: "La fecha de nacimiento es requerida",
  }),
  documentExpiry: z.date({
    required_error: "La fecha de vencimiento del documento es requerida",
  }),
  phone: z.string().min(1, "El teléfono es requerido"),
  email: z.string().email("Email inválido").min(1, "El email es requerido"),
  destination: z.string().min(1, "El destino es requerido"),
  departureDate: z.date({
    required_error: "La fecha de salida es requerida",
  }),
  returnDate: z.date({
    required_error: "La fecha de retorno es requerida",
  }),
  travelPurpose: z.string().min(1, "El motivo del viaje es requerido"),
  needsPassage: z.boolean().default(false),
  needsInsurance: z.boolean().default(false),
  insurancePeriod: z.string().optional(),
  emergencyContact: z.string().min(1, "El contacto de emergencia es requerido"),
  additionalObservations: z.string().optional(),
  preferredSchedule: z.string().optional(),
  requiresAllowance: z.boolean().default(false),
  allowanceAmount: z.number().min(0, "El monto debe ser mayor o igual a 0"),
  currency: z.string().min(1, "La moneda es requerida"),
  bank: z.string().optional(),
  accountNumber: z.string().optional(),
  accountHolder: z.string().optional(),
  hotelName: z.string().optional(),
  checkIn: z.date().optional(),
  checkOut: z.date().optional(),
  numberOfDays: z.number().min(0).optional(),
});

export type TravelRequestFormValues = z.infer<typeof travelRequestSchema>;