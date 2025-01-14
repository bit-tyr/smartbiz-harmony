import { TravelRequest } from "../types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AccommodationSectionProps {
  request: TravelRequest;
}

export const AccommodationSection = ({ request }: AccommodationSectionProps) => {
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return format(new Date(date), "PPP", { locale: es });
  };

  if (!request.hotelName) {
    return null;
  }

  return (
    <div>
      <h3 className="font-semibold mb-4">Alojamiento</h3>
      <dl className="space-y-3">
        <div>
          <dt className="text-sm text-gray-500">Hotel</dt>
          <dd>{request.hotelName}</dd>
        </div>
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
      </dl>
    </div>
  );
};