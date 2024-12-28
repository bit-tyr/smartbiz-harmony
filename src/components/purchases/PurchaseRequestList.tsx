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
import { Search, Filter, Loader2, FileDown, FileSpreadsheet, CheckSquare, ShoppingCart, History } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { utils, writeFileXLSX } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          console.error('No hay sesión de usuario');
          toast.error("No hay sesión de usuario");
          throw new Error("No authenticated user");
        }

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
          console.error('Error detallado al cargar solicitudes:', error);
          toast.error(`Error al cargar las solicitudes: ${error.message}`);
          throw error;
        }

        if (!data) {
          return [];
        }

        return data;
      } catch (error) {
        console.error('Error inesperado al cargar solicitudes:', error);
        toast.error("Error inesperado al cargar las solicitudes");
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
    enabled: initialLoadDone
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant={currentView === 'current' ? "secondary" : "ghost"}
              onClick={() => setCurrentView('current')}
              className="flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Solicitudes Actuales
            </Button>
            <Button
              variant={currentView === 'history' ? "secondary" : "ghost"}
              onClick={() => setCurrentView('history')}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              Histórico
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-[400px] bg-muted/10 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  if (!requests?.length) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant={currentView === 'current' ? "secondary" : "ghost"}
              onClick={() => setCurrentView('current')}
              className="flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Solicitudes Actuales
            </Button>
            <Button
              variant={currentView === 'history' ? "secondary" : "ghost"}
              onClick={() => setCurrentView('history')}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              Histórico
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-[400px] bg-muted/10 rounded-lg">
          <div className="text-center space-y-4">
            <p className="text-2xl font-semibold text-primary">No hay solicitudes</p>
            <p className="text-muted-foreground">
              {currentView === 'current' 
                ? "No se encontraron solicitudes de compra activas"
                : "No se encontraron solicitudes en el histórico"
              }
            </p>
          </div>
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

    // Log temporal para debugging
    if (currentView === 'history') {
      console.log('Solicitudes en histórico:', requests.filter(r => r.deleted_at).map(r => ({
        id: r.id,
        number: r.number,
        deleted_at: r.deleted_at
      })));
    }

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
      if (currentView === 'history') {
        console.log('Intentando eliminar solicitud:', selectedRequestId);
        
        // Primero verificamos los items asociados
        const { data: items, error: checkError } = await supabase
          .from('purchase_request_items')
          .select('id')
          .eq('purchase_request_id', selectedRequestId);
          
        console.log('Items asociados:', items);

        if (checkError) {
          console.error('Error al verificar items:', checkError);
          throw checkError;
        }

        // Primero eliminamos los items asociados
        const { error: itemsError } = await supabase
          .from('purchase_request_items')
          .delete()
          .eq('purchase_request_id', selectedRequestId);

        if (itemsError) {
          console.error('Error al eliminar items:', itemsError);
          throw itemsError;
        }

        console.log('Items eliminados exitosamente');

        // Luego eliminamos la solicitud principal
        const { error } = await supabase
          .from('purchase_requests')
          .delete()
          .eq('id', selectedRequestId);

        if (error) {
          console.error('Error al eliminar solicitud principal:', error);
          throw error;
        }

        console.log('Solicitud principal eliminada exitosamente');
        toast.success("Solicitud eliminada permanentemente");
      } else {
        // Mover al histórico para solicitudes actuales
        const { error } = await supabase
          .from('purchase_requests')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', selectedRequestId);

        if (error) throw error;
        toast.success("Solicitud movida al histórico exitosamente");
      }

      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
    } catch (error) {
      console.error('Error completo al procesar la solicitud:', error);
      toast.error(currentView === 'history' 
        ? "Error al eliminar la solicitud permanentemente"
        : "Error al mover la solicitud al histórico"
      );
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedRequestId(null);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      // Verificar si el usuario tiene permisos para cambiar el estado
      if (!userRole || !['admin', 'manager', 'purchases'].includes(userRole)) {
        toast.error("No tienes permisos para cambiar el estado de las solicitudes");
        return;
      }

      // Solo permitir cambios si la solicitud no está eliminada
      const request = requests.find(r => r.id === requestId);
      if (request?.deleted_at) {
        toast.error("No se puede cambiar el estado de una solicitud eliminada");
        return;
      }

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

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map(request => request.id));
    }
  };

  const exportToExcel = () => {
    if (selectedRequests.length === 0) {
      toast.error("Por favor selecciona al menos una solicitud");
      return;
    }

    const selectedData = filteredRequests
      .filter(request => selectedRequests.includes(request.id))
      .map(request => ({
        'Número': request.number,
        'Laboratorio': request.laboratory?.name,
        'Código Presupuestal': `${request.budget_code?.code} - ${request.budget_code?.description}`,
        'Producto': request.purchase_request_items?.[0]?.product?.name,
        'Proveedor': request.purchase_request_items?.[0]?.product?.supplier?.name,
        'Cantidad': request.purchase_request_items?.[0]?.quantity,
        'Precio Unitario': request.purchase_request_items?.[0]?.unit_price,
        'Moneda': request.purchase_request_items?.[0]?.currency,
        'Estado': statusConfig[request.status]?.label,
        'Fecha': new Date(request.created_at).toLocaleDateString(),
        'Observaciones': request.observations,
        'Creado por': `${request.profiles?.first_name || ''} ${request.profiles?.last_name || ''}`
      }));

    const ws = utils.json_to_sheet(selectedData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Solicitudes");
    writeFileXLSX(wb, "solicitudes_compra.xlsx");
    toast.success("Archivo Excel exportado exitosamente");
  };

  const exportToPDF = () => {
    if (selectedRequests.length === 0) {
      toast.error("Por favor selecciona al menos una solicitud");
      return;
    }

    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Reporte de Solicitudes de Compra", 14, 15);
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 25);

    const selectedData = filteredRequests
      .filter(request => selectedRequests.includes(request.id))
      .map(request => [
        request.number.toString(),
        request.laboratory?.name || '',
        request.purchase_request_items?.[0]?.product?.name || '',
        request.purchase_request_items?.[0]?.quantity?.toString() || '',
        `${request.purchase_request_items?.[0]?.currency} ${request.purchase_request_items?.[0]?.unit_price}` || '',
        statusConfig[request.status]?.label || '',
        new Date(request.created_at).toLocaleDateString(),
        `${request.profiles?.first_name || ''} ${request.profiles?.last_name || ''}`
      ]);

    (doc as any).autoTable({
      startY: 35,
      head: [['Número', 'Laboratorio', 'Producto', 'Cantidad', 'Precio', 'Estado', 'Fecha', 'Creado por']],
      body: selectedData,
      theme: 'striped',
      headStyles: { fillColor: [63, 63, 70] },
      styles: { fontSize: 8 },
      margin: { top: 35 }
    });

    doc.save("solicitudes_compra.pdf");
    toast.success("Archivo PDF exportado exitosamente");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={currentView === 'current' ? "secondary" : "ghost"}
            onClick={() => setCurrentView('current')}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Solicitudes Actuales
          </Button>
          <Button
            variant={currentView === 'history' ? "secondary" : "ghost"}
            onClick={() => setCurrentView('history')}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            Histórico
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportToExcel}
            disabled={selectedRequests.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
          <Button
            variant="outline"
            onClick={exportToPDF}
            disabled={selectedRequests.length === 0}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Exportar PDF
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
          <Button
            variant="outline"
            onClick={handleSelectAll}
            className="flex items-center gap-2"
          >
            <CheckSquare className="h-4 w-4" />
            {selectedRequests.length === filteredRequests.length ? "Deseleccionar Todo" : "Seleccionar Todo"}
          </Button>
          <ColumnSelector 
            visibleColumns={visibleColumns} 
            onColumnChange={handleColumnChange}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <PurchaseRequestTableHeader 
            visibleColumns={visibleColumns} 
            showSelection={true}
            onSelectAll={handleSelectAll}
            allSelected={selectedRequests.length === filteredRequests.length}
          />
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
                isSelected={selectedRequests.includes(request.id)}
                onSelect={() => handleSelectRequest(request.id)}
                showSelection={true}
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
              {currentView === 'history' 
                ? "Esta acción eliminará permanentemente la solicitud de compra. Esta acción no se puede deshacer."
                : "Esta acción moverá la solicitud de compra al histórico. Podrás consultarla en la pestaña de histórico."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {currentView === 'history' ? 'Eliminar permanentemente' : 'Mover al histórico'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
