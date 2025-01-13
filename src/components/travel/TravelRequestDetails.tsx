import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TravelRequest, TravelRequestStatus } from "./types";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { useState } from "react";
import { TravelRequestForm } from "./TravelRequestForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { TravelRequestFormValues } from "./schemas/travelRequestSchema";

interface TravelRequestDetailsProps {
  request: TravelRequest | null;
  onClose: () => void;
}

export const TravelRequestDetails = ({ request, onClose }: TravelRequestDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  if (!request) return null;

  const handleSubmit = async (values: TravelRequestFormValues) => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('travel_requests')
        .update(values)
        .eq('id', request.id);

      if (error) throw error;

      toast.success("Solicitud de viaje actualizada exitosamente");
      queryClient.invalidateQueries({ queryKey: ['travelRequests'] });
      onClose();
    } catch (error) {
      console.error('Error updating travel request:', error);
      toast.error("Error al actualizar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return format(new Date(date), "PPP", { locale: es });
  };

  return (
    <Dialog open={!!request} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Detalles de la Solicitud de Viaje</DialogTitle>
            {!request.deleted_at && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                <span>Editar</span>
              </Button>
            )}
          </div>
        </DialogHeader>

        {isEditing ? (
          <TravelRequestForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onCancel={() => setIsEditing(false)}
            initialValues={{
              laboratoryId: request.laboratoryId,
              budgetCodeId: request.budgetCodeId,
              firstName: request.firstName,
              lastName: request.lastName,
              documentNumber: request.documentNumber,
              birthDate: new Date(request.birthDate),
              documentExpiry: new Date(request.documentExpiry),
              phone: request.phone,
              email: request.email,
              destination: request.destination,
              departureDate: new Date(request.departureDate),
              returnDate: new Date(request.returnDate),
              travelPurpose: request.travelPurpose,
              needsPassage: request.needsPassage,
              needsInsurance: request.needsInsurance,
              emergencyContact: request.emergencyContact,
              preferredSchedule: request.preferredSchedule,
              allowanceAmount: request.allowanceAmount,
              requiresAllowance: request.requiresAllowance,
              currency: request.currency,
              bank: request.bank,
              accountNumber: request.accountNumber,
              accountHolder: request.accountHolder,
              hotelName: request.hotelName,
              checkIn: request.checkIn ? new Date(request.checkIn) : null,
              checkOut: request.checkOut ? new Date(request.checkOut) : null,
              numberOfDays: request.numberOfDays,
            }}
            isEditing={true}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Información Personal</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-500">Nombre</dt>
                    <dd>{request.firstName} {request.lastName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Documento</dt>
                    <dd>{request.documentNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Fecha de Nacimiento</dt>
                    <dd>{formatDate(request.birthDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Vencimiento del Documento</dt>
                    <dd>{formatDate(request.documentExpiry)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Teléfono</dt>
                    <dd>{request.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Email</dt>
                    <dd>{request.email}</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Información del Viaje</h3>
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
                    <dt className="text-sm text-gray-500">Fecha de Salida</dt>
                    <dd>{formatDate(request.departureDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Fecha de Retorno</dt>
                    <dd>{formatDate(request.returnDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Propósito del Viaje</dt>
                    <dd>{request.travelPurpose}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Requiere Pasaje</dt>
                    <dd>{request.needsPassage ? 'Sí' : 'No'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Requiere Seguro</dt>
                    <dd>{request.needsInsurance ? 'Sí' : 'No'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Horario Preferido</dt>
                    <dd>{request.preferredSchedule || '-'}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Información de Viáticos</h3>
                <dl className="space-y-2">
                  {request.requiresAllowance && (
                    <>
                      <div>
                        <dt className="text-sm text-gray-500">Monto de Viáticos</dt>
                        <dd>{request.allowanceAmount} {request.currency}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Banco</dt>
                        <dd>{request.bank || "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Número de Cuenta</dt>
                        <dd>{request.accountNumber || "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Titular de la Cuenta</dt>
                        <dd>{request.accountHolder || "-"}</dd>
                      </div>
                    </>
                  )}
                  {!request.requiresAllowance && (
                    <div>
                      <dd className="text-gray-500">No requiere viáticos</dd>
                    </div>
                  )}
                </dl>
              </div>

              {request.hotelName && (
                <div>
                  <h3 className="font-semibold mb-2">Información de Alojamiento</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">Hotel</dt>
                      <dd>{request.hotelName}</dd>
                    </div>
                    {request.checkIn && request.checkOut && (
                      <>
                        <div>
                          <dt className="text-sm text-gray-500">Check-in</dt>
                          <dd>{formatDate(request.checkIn)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500">Check-out</dt>
                          <dd>{formatDate(request.checkOut)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500">Número de Días</dt>
                          <dd>{request.numberOfDays}</dd>
                        </div>
                      </>
                    )}
                  </dl>
                </div>
              )}
            </div>

            {request.emergencyContact && (
              <div>
                <h3 className="font-semibold mb-2">Contacto de Emergencia</h3>
                <p>{request.emergencyContact}</p>
              </div>
            )}

            {request.additional_observations && (
              <div>
                <h3 className="font-semibold mb-2">Observaciones Adicionales</h3>
                <p>{request.additional_observations}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};