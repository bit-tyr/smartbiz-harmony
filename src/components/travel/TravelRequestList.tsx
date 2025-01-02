import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface TravelRequestListProps {
  onSelectRequest: (request: any) => void;
}

export const TravelRequestList = ({ onSelectRequest }: TravelRequestListProps) => {
  const { data: requests, isLoading } = useQuery({
    queryKey: ['travelRequests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('travel_requests')
        .select(`
          *,
          laboratory:laboratories(name),
          budget_code:budget_codes(code, description),
          travel_expenses(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Cargando solicitudes...</div>;
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pendiente: "bg-yellow-100 text-yellow-800",
      aprobado_por_gerente: "bg-blue-100 text-blue-800",
      aprobado_por_finanzas: "bg-green-100 text-green-800",
      rechazado: "bg-red-100 text-red-800",
      completado: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles]}>
        {status.replace(/_/g, " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Destino</TableHead>
          <TableHead>Laboratorio</TableHead>
          <TableHead>Fechas</TableHead>
          <TableHead>Presupuesto</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="w-[100px]">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests?.map((request) => (
          <TableRow key={request.id}>
            <TableCell>{request.destination}</TableCell>
            <TableCell>{request.laboratory?.name}</TableCell>
            <TableCell>
              {format(new Date(request.departure_date), 'dd/MM/yyyy')} - 
              {format(new Date(request.return_date), 'dd/MM/yyyy')}
            </TableCell>
            <TableCell>
              {request.total_estimated_budget} {request.currency}
            </TableCell>
            <TableCell>
              {getStatusBadge(request.status)}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSelectRequest(request)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};