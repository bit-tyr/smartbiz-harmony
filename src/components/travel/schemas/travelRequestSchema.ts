import { z } from "zod";

export const travelRequestSchema = z.object({
  laboratoryId: z.string().min(1, "El laboratorio es requerido"),
  projectId: z.string().optional(),
  destination: z.string().min(1, "El destino es requerido"),
  departureDate: z.string().min(1, "La fecha de salida es requerida"),
  returnDate: z.string().min(1, "La fecha de retorno es requerida"),
  purpose: z.string().min(1, "El propósito es requerido"),
  totalEstimatedBudget: z.string().min(1, "El presupuesto estimado es requerido"),
  currency: z.string().min(1, "La moneda es requerida"),
});

export type TravelRequestFormValues = z.infer<typeof travelRequestSchema>;