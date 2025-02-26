
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
  const { data: requests } = useQuery<PurchaseRequest[]>({
    queryKey: ['purchaseRequests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_requests')
        .select(`
          *,
          laboratory:laboratories!left(
            id,
            name,
            created_at,
            description
          ),
          budget_code:budget_codes!left(
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

      if (error) throw error;
      
      // Transform the data to ensure it matches PurchaseRequest type
      const transformedData = (data || []).map(item => ({
        ...item,
        laboratory: item.laboratory || null,
        budget_code: item.budget_code || null,
        purchase_request_items: item.purchase_request_items || []
      }));

      return transformedData;
    }
  });

  if (!requests || requests.length === 0) {
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
