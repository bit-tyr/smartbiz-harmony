import { TravelRequest } from "../types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PersonalInfoSectionProps {
  request: TravelRequest;
}

export const PersonalInfoSection = ({ request }: PersonalInfoSectionProps) => {
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return format(new Date(date), "PPP", { locale: es });
  };

  return (
    <div>
      <h3 className="font-semibold mb-4">Información Personal</h3>
      <dl className="space-y-3">
        <div>
          <dt className="text-sm text-gray-500">Nombre Completo</dt>
          <dd>{request.first_name} {request.last_name}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Documento</dt>
          <dd>{request.document_number || '-'}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Fecha de Nacimiento</dt>
          <dd>{formatDate(request.birth_date)}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Vencimiento del Documento</dt>
          <dd>{formatDate(request.document_expiry)}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Teléfono</dt>
          <dd>{request.phone || '-'}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Email</dt>
          <dd>{request.email || '-'}</dd>
        </div>
      </dl>
    </div>
  );
};