import { TravelRequest } from "../types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AccommodationSectionProps {
  request: TravelRequest;
}

export const AccommodationSection = ({ request }: AccommodationSectionProps) => {
  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    return format(new Date(date), "PPP", { locale: es });
  };

  if (!request.hotel_name) {
    return (
      <div>
        <h3 className="font-semibold mb-4">Alojamiento</h3>
        <p className="text-gray-500">No requiere alojamiento</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold mb-4">Alojamiento</h3>
      <dl className="space-y-3">
        <div>
          <dt className="text-sm text-gray-500">Hotel</dt>
          <dd>{request.hotel_name}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Check-in</dt>
          <dd>{formatDate(request.check_in)}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Check-out</dt>
          <dd>{formatDate(request.check_out)}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Número de Días</dt>
          <dd>{request.number_of_days || '-'}</dd>
        </div>
      </dl>
    </div>
  );
};