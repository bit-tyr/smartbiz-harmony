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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface TravelRequestListProps {
  onSelectRequest: (request: any) => void;
}

type TravelRequestStatus = "pendiente" | "aprobado_por_gerente" | "aprobado_por_finanzas" | "rechazado" | "completado";

const statusConfig: Record<TravelRequestStatus, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
  aprobado_por_gerente: { label: "Aprobado por Gerente", className: "bg-blue-100 text-blue-800" },
  aprobado_por_finanzas: { label: "Aprobado por Finanzas", className: "bg-green-100 text-green-800" },
  rechazado: { label: "Rechazado", className: "bg-red-100 text-red-800" },
  completado: { label: "Completado", className: "bg-gray-100 text-gray-800" }
};

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
          travel_expenses(*),
          profiles:profiles!travel_requests_user_id_fkey(
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleStatusChange = async (requestId: string, newStatus: TravelRequestStatus) => {
    try {
      const { error } = await supabase
        .from('travel_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;
      toast.success('Estado actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  if (isLoading) {
    return <div>Cargando solicitudes...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Solicitante</TableHead>
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
            <TableCell>
              {request.profiles?.first_name} {request.profiles?.last_name}
            </TableCell>
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
              <Select
                value={request.status}
                onValueChange={(value: TravelRequestStatus) => handleStatusChange(request.id, value)}
              >
                <SelectTrigger className={`w-[200px] ${statusConfig[request.status as TravelRequestStatus]?.className}`}>
                  <SelectValue>
                    {statusConfig[request.status as TravelRequestStatus]?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="aprobado_por_gerente">Aprobado por Gerente</SelectItem>
                  <SelectItem value="aprobado_por_finanzas">Aprobado por Finanzas</SelectItem>
                  <SelectItem value="rechazado">Rechazado</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                </SelectContent>
              </Select>
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