
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseRequest } from "./types";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export const PurchaseRequestTable = () => {
  const { data: requests = [] } = useQuery<PurchaseRequest[]>({
    queryKey: ['purchaseRequests'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('purchase_requests')
          .select(`
            id,
            number,
            created_at,
            deleted_at,
            user_id,
            laboratory_id,
            budget_code_id,
            observations,
            status,
            actions,
            total_amount,
            laboratory:laboratories(
              id,
              name,
              created_at,
              description
            ),
            budget_code:budget_codes(
              id,
              code,
              description,
              created_at
            ),
            purchase_request_items(
              id,
              quantity,
              unit_price,
              currency,
              product:products(
                id,
                name,
                supplier:suppliers(
                  id,
                  name
                )
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching purchase requests:', error);
          return [];
        }

        // Transform and validate the data
        return (data || []).map(request => ({
          id: request.id,
          number: request.number,
          created_at: request.created_at,
          deleted_at: request.deleted_at,
          user_id: request.user_id,
          laboratory_id: request.laboratory_id,
          budget_code_id: request.budget_code_id,
          observations: request.observations,
          status: request.status,
          actions: request.actions,
          total_amount: request.total_amount,
          laboratory: request.laboratory || null,
          budget_code: request.budget_code || null,
          purchase_request_items: request.purchase_request_items || []
        })) as PurchaseRequest[];
      } catch (error) {
        console.error('Unexpected error:', error);
        return [];
      }
    }
  });

  if (requests.length === 0) {
    return <div>No hay solicitudes</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Número</TableHead>
          <TableHead>Laboratorio</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fecha</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell>{request.number}</TableCell>
            <TableCell>{request.laboratory?.name}</TableCell>
            <TableCell>{request.status}</TableCell>
            <TableCell>
              {request.created_at ? new Date(request.created_at).toLocaleDateString() : '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
