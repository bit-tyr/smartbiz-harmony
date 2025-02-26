import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PurchaseRequestDetails from "./PurchaseRequestDetails";
import { PurchaseRequest } from "./types";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

interface PurchaseRequestListProps {
  searchQuery: string;
  onSelect: (request: PurchaseRequest) => void;
  view: 'current' | 'history';
  onSearchChange: (searchQuery: string) => void;
}

const PurchaseRequestList = ({ searchQuery, onSelect, view, onSearchChange }: PurchaseRequestListProps) => {
  const { data: requests } = useQuery<PurchaseRequest[]>({
    queryKey: ['purchaseRequests', view],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_requests')
        .select(`
          *,
          laboratory:laboratories(id, name, created_at, description),
          budget_code:budget_codes(code, description),
          purchase_request_items(
            quantity,
            unit_price,
            currency,
            product:products(
              name,
              supplier:suppliers(name)
            )
          )
        `)
        .eq('status', view === 'current' ? 'pending' : 'completed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching purchase requests:', error);
        toast.error("Error al cargar las solicitudes");
        throw error;
      }

      return data as unknown as PurchaseRequest[];
    },
  });

  const filteredRequests = requests?.filter(request => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      request.number?.toLowerCase().includes(searchTerm) ||
      request.laboratory?.name?.toLowerCase().includes(searchTerm) ||
      request.status?.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar solicitud..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      {filteredRequests && filteredRequests.length > 0 ? (
        <div className="overflow-x-auto">
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
              {filteredRequests.map((request) => (
                <TableRow
                  key={request.id}
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => onSelect(request)}
                >
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
        </div>
      ) : (
        <p>No se encontraron solicitudes.</p>
      )}
    </div>
  );
};

export default PurchaseRequestList;
