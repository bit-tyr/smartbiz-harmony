
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
          laboratory:laboratories(id, name, created_at, description),
          budget_code:budget_codes(id, code, description),
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
      return data;
    }
  });

  return (
    <div className="w-full">
      {requests && requests.length > 0 ? (
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
                  {new Date(request.created_at || '').toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>No hay solicitudes</p>
      )}
    </div>
  );
};
