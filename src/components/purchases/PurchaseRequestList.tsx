import { Table, TableBody } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { PurchaseRequestTableHeader } from "./table/PurchaseRequestTableHeader";
import { PurchaseRequestTableRow } from "./table/PurchaseRequestTableRow";
import { ColumnSelector } from "./table/ColumnSelector";
import { Input } from "@/components/ui/input";
import { PurchaseRequestDetails } from "./PurchaseRequestDetails";
import { PurchaseRequest } from "./types";
import { useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PurchaseRequestListProps {
  requests: PurchaseRequest[];
  isLoading: boolean;
  onSelectRequest?: (request: PurchaseRequest | null) => void;
}

const statusConfig = {
  pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  in_process: { label: "En Proceso", className: "bg-blue-100 text-blue-800 border-blue-200" },
  purchased: { label: "Comprado", className: "bg-green-100 text-green-800 border-green-200" },
  ready_for_delivery: { label: "Listo para Entrega", className: "bg-purple-100 text-purple-800 border-purple-200" },
  delivered: { label: "Entregado", className: "bg-gray-100 text-gray-800 border-gray-200" }
};

export const PurchaseRequestList = ({ onSelectRequest }: PurchaseRequestListProps) => {
  const [visibleColumns, setVisibleColumns] = useState({
    number: true,
    laboratory: true,
    budgetCode: true,
    product: true,
    supplier: true,
    quantity: true,
    unitPrice: true,
    currency: true,
    status: true,
    date: true,
    observations: true,
    creator: true,
  });

  const [currentView, setCurrentView] = useState<'current' | 'history'>('current');
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select(`
            role_id,
            roles:roles(name)
          `)
          .eq('id', session.user.id)
          .single();
        
        setUserRole(profile?.roles?.name?.toLowerCase());
        setInitialLoadDone(true);
      }
    };
    
    getUserRole();
  }, []);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['purchaseRequests', userRole, currentView],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("No authenticated user");

      let query = supabase
        .from('purchase_requests')
        .select(`
          *,
          laboratory:laboratories(
            id,
            name
          ),
          budget_code:budget_codes(
            id,
            code,
            description
          ),
          profiles!fk_user_id(first_name, last_name),
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

      if (currentView === 'current') {
        query = query.is('deleted_at', null);
      } else if (currentView === 'history') {
        query = query.not('deleted_at', 'is', null);
      }

      if (userRole === 'user') {
        query = query.eq('user_id', session.user.id);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching purchase requests:', error);
        throw error;
      }
      return data || [];
    },
    enabled: true
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] bg-muted/10 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando solicitudes...</p>
      </div>
    );
  }

  if (!requests?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] bg-muted/10 rounded-lg">
        <div className="text-center space-y-4">
          <p className="text-2xl font-semibold text-primary">No hay solicitudes</p>
          <p className="text-muted-foreground">
            No se encontraron solicitudes de compra registradas
          </p>
        </div>
      </div>
    );
  }

  const handleColumnChange = (column: string, checked: boolean) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: checked,
    }));
  };

  const filteredRequests = requests.filter(request => {
    const searchTerms = searchQuery.toLowerCase().trim();
    
    if (!searchTerms) return true;

    const searchableFields = [
      request.number?.toString(),
      request.laboratory?.name,
      request.budget_code?.code,
      request.budget_code?.description,
      request.purchase_request_items?.[0]?.product?.name,
      request.purchase_request_items?.[0]?.product?.supplier?.name,
      request.observations,
      request.profiles?.first_name,
      request.profiles?.last_name,
      statusConfig[request.status]?.label
    ];

    return searchableFields.some(field => 
      field?.toLowerCase().includes(searchTerms)
    );
  }).filter(request => {
    return statusFilter === "all" || !statusFilter || request.status === statusFilter;
  });

  const handleDeleteClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRequestId) return;

    try {
      const { error } = await supabase
        .from('purchase_requests')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', selectedRequestId);

      if (error) throw error;

      toast.success("Solicitud movida al histórico exitosamente");
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
    } catch (error) {
      console.error('Error moving purchase request to history:', error);
      toast.error("Error al mover la solicitud al histórico");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedRequestId(null);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const { data, error } = await supabase
        .from('purchase_requests')
        .update({ status: newStatus })
        .eq('id', requestId)
        .select();

      if (error) {
        console.error('Error al actualizar estado:', error);
        toast.error("Error al actualizar el estado");
        return;
      }

      toast.success(`Estado actualizado a: ${statusConfig[newStatus].label}`);
      await queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
    } catch (error) {
      console.error('Error:', error);
      toast.error("Error al actualizar el estado");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={currentView === 'current' ? "secondary" : "ghost"}
            onClick={() => setCurrentView('current')}
          >
            Solicitudes Actuales
          </Button>
          <Button
            variant={currentView === 'history' ? "secondary" : "ghost"}
            onClick={() => setCurrentView('history')}
          >
            Histórico
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-muted/30 p-4 rounded-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar solicitud..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px] bg-background">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="in_process">En proceso</SelectItem>
              <SelectItem value="purchased">Comprado</SelectItem>
              <SelectItem value="ready_for_delivery">Listo para entrega</SelectItem>
              <SelectItem value="delivered">Entregado</SelectItem>
            </SelectContent>
          </Select>
          <ColumnSelector 
            visibleColumns={visibleColumns} 
            onColumnChange={handleColumnChange}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <PurchaseRequestTableHeader visibleColumns={visibleColumns} />
          <TableBody>
            {filteredRequests.map((request) => (
              <PurchaseRequestTableRow
                key={request.id}
                request={request}
                visibleColumns={visibleColumns}
                onClick={() => setSelectedRequest(request)}
                onDelete={handleDeleteClick}
                onStatusChange={handleStatusChange}
                userRole={userRole}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <PurchaseRequestDetails 
        request={selectedRequest} 
        onClose={() => setSelectedRequest(null)} 
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción moverá la solicitud de compra al histórico. Podrás consultarla en la pestaña de histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Mover al histórico
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
