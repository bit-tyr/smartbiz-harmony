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
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { TravelStatusSelector } from "./TravelStatusSelector";
import { TravelRequestStatus } from "./config/statusConfig";

interface TravelRequestListProps {
  onSelectRequest: (request: any) => void;
}

export const TravelRequestList = ({ onSelectRequest }: TravelRequestListProps) => {
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*, roles(name)')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          toast.error("Error al obtener el perfil del usuario");
          return;
        }

        if (profile) {
          setUserProfile(profile);
        }
      }
    };
    
    getUserProfile();
  }, []);

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['travelRequests'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authenticated session');
      }

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

      if (error) {
        console.error('Error fetching travel requests:', error);
        throw error;
      }
      return data;
    },
  });

  const handleStatusChange = async (requestId: string, newStatus: TravelRequestStatus) => {
    try {
      if (!userProfile) {
        toast.error("No se pudo determinar el perfil del usuario");
        return;
      }

      const request = requests?.find(r => r.id === requestId);
      if (!request) {
        toast.error("Solicitud no encontrada");
        return;
      }

      const userRole = userProfile.roles?.name?.toLowerCase();
      const canUpdateStatus = (
        (userRole === 'manager' && request.status === 'pendiente') ||
        (userRole === 'finance' && request.status === 'aprobado_por_gerente') ||
        userProfile.is_admin ||
        userRole === 'purchases'
      );

      if (!canUpdateStatus) {
        toast.error("No tienes permisos para realizar este cambio de estado");
        return;
      }

      const { error } = await supabase
        .from('travel_requests')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(userRole === 'manager' ? {
            manager_id: userProfile.id,
          } : userRole === 'finance' ? {
            finance_approver_id: userProfile.id,
          } : {})
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error al actualizar estado:', error);
        toast.error("Error al actualizar el estado");
        return;
      }

      await refetch();
      toast.success('Estado actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  if (isLoading) {
    return <div>Cargando solicitudes...</div>;
  }

  const canUpdateStatus = userProfile?.roles?.name?.toLowerCase() === 'manager' ||
                         userProfile?.roles?.name?.toLowerCase() === 'finance' ||
                         userProfile?.is_admin ||
                         userProfile?.roles?.name?.toLowerCase() === 'purchases';

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
              <TravelStatusSelector
                status={request.status as TravelRequestStatus}
                onStatusChange={(status) => handleStatusChange(request.id, status)}
                disabled={!canUpdateStatus}
              />
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