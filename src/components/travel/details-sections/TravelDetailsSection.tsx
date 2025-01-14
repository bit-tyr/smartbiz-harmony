import { TravelRequest } from "../types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TravelDetailsSectionProps {
  request: TravelRequest;
}

export const TravelDetailsSection = ({ request }: TravelDetailsSectionProps) => {
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return format(new Date(date), "PPP", { locale: es });
  };

  return (
    <div>
      <h3 className="font-semibold mb-4">Detalles del Viaje</h3>
      <dl className="space-y-3">
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
          <dd>{request.travelPurpose || '-'}</dd>
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
        <div>
          <dt className="text-sm text-gray-500">Contacto de Emergencia</dt>
          <dd>{request.emergencyContact || '-'}</dd>
        </div>
      </dl>
    </div>
  );
};