import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TravelExpenseForm } from "./TravelExpenseForm";
import { TravelExpenseList } from "./TravelExpenseList";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TravelRequest {
  id: string;
  destination: string;
  departure_date: string;
  return_date: string;
  purpose: string;
  status: string;
  total_estimated_budget: number;
  currency: string;
  first_name?: string;
  last_name?: string;
  document_number?: string;
  birth_date?: string;
  document_expiry?: string;
  phone?: string;
  email?: string;
  emergency_contact?: string;
  needs_passage?: boolean;
  needs_insurance?: boolean;
  insurance_period?: string;
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
  additional_observations?: string;
  laboratory?: {
    name: string;
  };
  budget_code?: {
    code: string;
    description: string;
  };
}

interface TravelRequestDetailsProps {
  request: TravelRequest | null;
  onClose: () => void;
}

export const TravelRequestDetails = ({ request, onClose }: TravelRequestDetailsProps) => {
  if (!request) return null;

  return (
    <Dialog open={!!request} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Detalles del Viaje a {request.destination}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-100px)]">
          <div className="space-y-6 p-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Información General</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-500">Estado</dt>
                    <dd>{request.status}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Destino</dt>
                    <dd>{request.destination}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Fechas</dt>
                    <dd>
                      {format(new Date(request.departure_date), "PPP", { locale: es })} -{" "}
                      {format(new Date(request.return_date), "PPP", { locale: es })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Propósito</dt>
                    <dd>{request.purpose}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Presupuesto Estimado</dt>
                    <dd>
                      {request.currency} {request.total_estimated_budget}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Laboratorio</dt>
                    <dd>{request.laboratory?.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Código de Presupuesto</dt>
                    <dd>{request.budget_code?.code} - {request.budget_code?.description}</dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Información Personal</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-500">Nombre Completo</dt>
                    <dd>{request.first_name} {request.last_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Documento</dt>
                    <dd>{request.document_number}</dd>
                  </div>
                  {request.birth_date && (
                    <div>
                      <dt className="text-sm text-gray-500">Fecha de Nacimiento</dt>
                      <dd>{format(new Date(request.birth_date), "PPP", { locale: es })}</dd>
                    </div>
                  )}
                  {request.document_expiry && (
                    <div>
                      <dt className="text-sm text-gray-500">Vencimiento de Documento</dt>
                      <dd>{format(new Date(request.document_expiry), "PPP", { locale: es })}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm text-gray-500">Teléfono</dt>
                    <dd>{request.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Email</dt>
                    <dd>{request.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Contacto de Emergencia</dt>
                    <dd>{request.emergency_contact}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Detalles del Viaje</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-500">Requiere Pasaje</dt>
                    <dd>{request.needs_passage ? "Sí" : "No"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Requiere Seguro</dt>
                    <dd>{request.needs_insurance ? "Sí" : "No"}</dd>
                  </div>
                  {request.insurance_period && (
                    <div>
                      <dt className="text-sm text-gray-500">Período de Seguro</dt>
                      <dd>{request.insurance_period}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm text-gray-500">Horario Preferido</dt>
                    <dd>{request.preferred_schedule}</dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Información de Alojamiento</h3>
                <dl className="space-y-2">
                  {request.hotel_name && (
                    <div>
                      <dt className="text-sm text-gray-500">Hotel</dt>
                      <dd>{request.hotel_name}</dd>
                    </div>
                  )}
                  {request.check_in && request.check_out && (
                    <div>
                      <dt className="text-sm text-gray-500">Fechas de Hospedaje</dt>
                      <dd>
                        {format(new Date(request.check_in), "PPP", { locale: es })} -{" "}
                        {format(new Date(request.check_out), "PPP", { locale: es })}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm text-gray-500">Número de Días</dt>
                    <dd>{request.number_of_days}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {request.requires_allowance && (
              <div className="space-y-4">
                <h3 className="font-semibold">Información de Viáticos</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-500">Monto de Viáticos</dt>
                    <dd>{request.currency} {request.allowance_amount}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Banco</dt>
                    <dd>{request.bank}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Número de Cuenta</dt>
                    <dd>{request.account_number}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Titular de la Cuenta</dt>
                    <dd>{request.account_holder}</dd>
                  </div>
                </dl>
              </div>
            )}

            {request.additional_observations && (
              <div className="space-y-4">
                <h3 className="font-semibold">Observaciones Adicionales</h3>
                <p className="text-sm">{request.additional_observations}</p>
              </div>
            )}

            <Tabs defaultValue="expenses" className="w-full">
              <TabsList>
                <TabsTrigger value="expenses">Gastos</TabsTrigger>
                <TabsTrigger value="new-expense">Nuevo Gasto</TabsTrigger>
              </TabsList>
              <TabsContent value="expenses">
                <TravelExpenseList travelRequestId={request.id} />
              </TabsContent>
              <TabsContent value="new-expense">
                <TravelExpenseForm travelRequestId={request.id} />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};