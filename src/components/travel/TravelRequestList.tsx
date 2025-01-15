import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TravelRequest } from "./types";
import { useState } from "react";
import { TravelRequestDetails } from "./TravelRequestDetails";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface TravelRequestListProps {
  onSelectRequest: (request: TravelRequest) => void;
}

export const TravelRequestList = ({ onSelectRequest }: TravelRequestListProps) => {
  const [selectedRequest, setSelectedRequest] = useState<TravelRequest | null>(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['travelRequests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('travel_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TravelRequest[];
    }
  });

  const formatDate = (date: string) => {
    return format(new Date(date), "PPP", { locale: es });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'aprobado_por_gerente':
        return 'bg-blue-100 text-blue-800';
      case 'aprobado_por_finanzas':
        return 'bg-green-100 text-green-800';
      case 'rechazado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div>Cargando solicitudes...</div>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Destino</TableHead>
            <TableHead>Fecha de Salida</TableHead>
            <TableHead>Fecha de Retorno</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests?.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.destination}</TableCell>
              <TableCell>{formatDate(request.departure_date)}</TableCell>
              <TableCell>{formatDate(request.return_date)}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusBadgeClass(request.status || 'pendiente')}`}>
                  {request.status?.replace('_', ' ').toUpperCase() || 'PENDIENTE'}
                </span>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRequest(request)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver detalles
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedRequest && (
        <TravelRequestDetails
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
};