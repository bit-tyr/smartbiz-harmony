import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PurchaseRequestDetails from "./PurchaseRequestDetails";
import { PurchaseRequest } from "./types";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { PurchaseRequestTableRow } from "./table/PurchaseRequestTableRow";

interface PurchaseRequestListProps {
  searchQuery: string;
  onSelect: (request: PurchaseRequest | null) => void;
  view: 'current' | 'history';
  onSearchChange: (searchQuery: string) => void;
}

const PurchaseRequestList = ({
  searchQuery,
  onSelect,
  view,
  onSearchChange
}: PurchaseRequestListProps) => {
  const { data: purchaseRequests, isLoading } = useQuery({
    queryKey: ['purchaseRequests', view],
    queryFn: async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error de sesión:', sessionError);
          toast.error("Error al verificar la sesión");
          throw sessionError;
        }

        if (!session?.user) {
          toast.error("Usuario no autenticado");
          throw new Error("No authenticated user");
        }

        const query = supabase
          .from('purchase_requests')
          .select(`
            *,
            laboratory:laboratories(id, name),
            budget_code:budget_codes(id, code, description),
            profile:profiles!purchase_requests_creator_id_fkey(first_name, last_name),
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
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
          console.error('Error al cargar las solicitudes:', error);
          toast.error(`Error al cargar las solicitudes: ${error.message}`);
          throw error;
        }

        if (!data) {
          return [];
        }

        return data as PurchaseRequest[];
      } catch (error) {
        console.error('Error inesperado:', error);
        toast.error("Error inesperado al cargar las solicitudes");
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  const filteredRequests = purchaseRequests?.filter((request) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      request.number?.toLowerCase().includes(searchTerm) ||
      request.laboratory?.name?.toLowerCase().includes(searchTerm) ||
      request.budget_code?.code?.toLowerCase().includes(searchTerm) ||
      request.budget_code?.description?.toLowerCase().includes(searchTerm) ||
      request.profile?.first_name?.toLowerCase().includes(searchTerm) ||
      request.profile?.last_name?.toLowerCase().includes(searchTerm)
    );
  }) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <ScrollArea>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Número</TableHead>
              <TableHead>Laboratorio</TableHead>
              <TableHead>Código Presupuestal</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Cargando...</TableCell>
              </TableRow>
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No se encontraron solicitudes.</TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <PurchaseRequestTableRow
                  key={request.id}
                  request={request}
                  onSelect={onSelect}
                />
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      <PurchaseRequestDetails
        request={null}
        onClose={() => onSelect(null)}
      />
    </div>
  );
};

export default PurchaseRequestList;
