import { Table, TableBody } from "@/components/ui/table";
import { useState, useEffect, useCallback, useMemo } from "react";
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
import { Search, Filter, Loader2, FileDown, FileSpreadsheet, CheckSquare, ShoppingCart, History, Trash2 } from "lucide-react";
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
  searchQuery: string;
  onSelect: (request: PurchaseRequest | null) => void;
  view: 'current' | 'history';
  onSearchChange?: (value: string) => void;
}

const statusConfig = {
  pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  in_process: { label: "En Proceso", className: "bg-blue-100 text-blue-800 border-blue-200" },
  purchased: { label: "Comprado", className: "bg-green-100 text-green-800 border-green-200" },
  ready_for_delivery: { label: "Listo para Entrega", className: "bg-purple-100 text-purple-800 border-purple-200" },
  delivered: { label: "Entregado", className: "bg-gray-100 text-gray-800 border-gray-200" }
};

export const PurchaseRequestList = ({ searchQuery, onSelect, view, onSearchChange }: PurchaseRequestListProps) => {
  const [visibleColumns, setVisibleColumns] = useState({
    number: true,
    laboratory: false,
    budgetCode: true,
    product: true,
    supplier: false,
    quantity: false,
    unitPrice: true,
    currency: false,
    status: true,
    date: false,
    observations: false,
    creator: true,
  });

  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['purchaseRequests', userRole, view],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          toast.error("No hay sesión de usuario");
          throw new Error("No authenticated user");
        }

        let query = supabase
          .from('purchase_requests')
          .select(`
            *,
            laboratory:laboratories!laboratory_id(id, name),
            budget_code:budget_codes!budget_code_id(id, code, description),
            profile:profiles!user_id(
              id,
              first_name,
              last_name,
              roles:roles!role_id(name)
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

        if (view === 'current') {
          query = query.is('deleted_at', null);
        } else if (view === 'history') {
          query = query.not('deleted_at', 'is', null);
        }

        if (userRole === 'user') {
          query = query.eq('user_id', session.user.id);
        }

        const { data, error } = await query;
        if (error) {
          console.error('Error fetching purchase requests:', error);
          toast.error("Error al cargar las solicitudes");
          throw error;
        }

        return (data || []) as PurchaseRequest[];
      } catch (error) {
        console.error('Error fetching purchase requests:', error);
        throw error;
      }
    },
  });

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
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
        request.profile?.first_name,
        request.profile?.last_name,
        statusConfig[request.status]?.label
      ];

      return searchableFields.some(field => 
        field?.toLowerCase().includes(searchTerms)
      );
    }).filter(request => {
      return statusFilter === "all" || !statusFilter || request.status === statusFilter;
    });
  }, [requests, searchQuery, statusFilter]);

  const handleSelectAll = useCallback(() => {
    if (!filteredRequests) return;
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map(request => request.id));
    }
  }, [filteredRequests, selectedRequests]);

  const handleColumnChange = (column: string, checked: boolean) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: checked,
    }));
  };

  const handleDeleteClick = async (requestId: string) => {
    // Verificar si el usuario es el creador de la solicitud
    const request = requests.find(r => r.id === requestId);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      toast.error("No hay sesión de usuario");
      return;
    }

    // Si estamos en la vista de historial, solo admin, manager y purchases pueden borrar
    if (view === 'history') {
      if (!['admin', 'manager', 'Purchases'].includes(userRole)) {
        toast.error("No tienes permisos para eliminar solicitudes del historial");
        return;
      }
    } else {
      // En la vista actual, los usuarios solo pueden borrar sus propias solicitudes
      if (request?.user_id !== session.user.id && !['admin', 'manager', 'Purchases'].includes(userRole)) {
        toast.error("Solo puedes eliminar tus propias solicitudes");
        return;
      }
    }

    setSelectedRequestId(requestId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    // Doble verificación de seguridad para el historial
    if (view === 'history' && !['admin', 'manager', 'Purchases'].includes(userRole)) {
      toast.error("No tienes permisos para eliminar solicitudes del historial");
      setIsDeleteDialogOpen(false);
      return;
    }

    if (selectedRequestId === 'bulk') {
      // Eliminación masiva
      try {
        if (view === 'history') {
          // Verificar que el usuario tenga permisos para borrar del histórico
          if (!['admin', 'manager', 'Purchases'].includes(userRole)) {
            toast.error("No tienes permisos para eliminar solicitudes del historial");
            return;
          }
          // Eliminar permanentemente las solicitudes seleccionadas
          for (const requestId of selectedRequests) {
            const { error: itemsError } = await supabase
              .from('purchase_request_items')
              .delete()
              .eq('purchase_request_id', requestId);

            if (itemsError) throw itemsError;

            const { error } = await supabase
              .from('purchase_requests')
              .delete()
              .eq('id', requestId);

            if (error) throw error;
          }
          toast.success(`${selectedRequests.length} solicitudes eliminadas permanentemente`);
        } else {
          // Mover al histórico las solicitudes seleccionadas
          const { error } = await supabase
            .from('purchase_requests')
            .update({ deleted_at: new Date().toISOString() })
            .in('id', selectedRequests);

          if (error) throw error;
          toast.success(`${selectedRequests.length} solicitudes movidas al histórico`);
        }

        queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
        setSelectedRequests([]);
      } catch (error) {
        console.error('Error al procesar las solicitudes:', error);
        toast.error(view === 'history' 
          ? "Error al eliminar las solicitudes permanentemente"
          : "Error al mover las solicitudes al histórico"
        );
      }
    } else if (selectedRequestId) {
      // Eliminación individual
      try {
        if (view === 'history') {
          // Verificar que el usuario tenga permisos para borrar del histórico
          if (!['admin', 'manager', 'Purchases'].includes(userRole)) {
            toast.error("No tienes permisos para eliminar solicitudes del historial");
            return;
          }
          const { error: itemsError } = await supabase
            .from('purchase_request_items')
            .delete()
            .eq('purchase_request_id', selectedRequestId);

          if (itemsError) throw itemsError;

          const { error } = await supabase
            .from('purchase_requests')
            .delete()
            .eq('id', selectedRequestId);

          if (error) throw error;

          toast.success("Solicitud eliminada permanentemente");
        } else {
          const { error } = await supabase
            .from('purchase_requests')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', selectedRequestId);

          if (error) throw error;
          toast.success("Solicitud movida al histórico exitosamente");
        }

        queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
      } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        toast.error(view === 'history' 
          ? "Error al eliminar la solicitud permanentemente"
          : "Error al mover la solicitud al histórico"
        );
      }
    }

    setIsDeleteDialogOpen(false);
    setSelectedRequestId(null);
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      // Verificar si el usuario tiene permisos para cambiar el estado
      if (!userRole || !['admin', 'manager', 'Purchases'].includes(userRole)) {
        toast.error("No tienes permisos para cambiar el estado de las solicitudes");
        return;
      }

      // Solo permitir cambios si la solicitud no está eliminada
      const request = requests.find(r => r.id === requestId);
      if (request?.deleted_at) {
        toast.error("No se puede cambiar el estado de una solicitud eliminada");
        return;
      }

      // Si el nuevo estado es "delivered", también actualizamos deleted_at
      const updateData = {
        status: newStatus,
        ...(newStatus === 'delivered' ? { deleted_at: new Date().toISOString() } : {})
      };

      const { data, error } = await supabase
        .from('purchase_requests')
        .update(updateData)
        .eq('id', requestId)
        .select();

      if (error) {
        console.error('Error al actualizar estado:', error);
        toast.error("Error al actualizar el estado");
        return;
      }

      if (newStatus === 'delivered') {
        toast.success("Solicitud marcada como entregada y movida al histórico");
      } else {
        toast.success(`Estado actualizado a: ${statusConfig[newStatus].label}`);
      }
      
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
        'Creado por': `${request.profile?.first_name || ''} ${request.profile?.last_name || ''}`
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
    doc.text(`Fecha de generación: ${new Date().toISOString()}`, 14, 25);

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
        `${request.profile?.first_name || ''} ${request.profile?.last_name || ''}`
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

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('User ID:', session.user.id);
        // Primero verificamos si es un admin
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', session.user.id)
          .single();

        if (adminData) {
          setUserRole('admin');
          setInitialLoadDone(true);
          return;
        }

        // Si no es admin, verificamos su rol normal
        const { data: profile } = await supabase
          .from('profiles')
          .select(`
            role_id,
            roles:roles!role_id(name)
          `)
          .eq('id', session.user.id)
          .single();
        
        console.log('User Role:', profile?.roles?.name);
        setUserRole(profile?.roles?.name || null);
        setInitialLoadDone(true);
      }
    };
    
    getUserRole();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportToExcel}
              disabled={selectedRequests.length === 0}
              className="flex items-center gap-2 transition-all hover:scale-105"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
            <Button
              variant="outline"
              onClick={exportToPDF}
              disabled={selectedRequests.length === 0}
              className="flex items-center gap-2 transition-all hover:scale-105"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
          <Button
            variant="destructive"
            onClick={() => {
              setSelectedRequestId('bulk');
              setIsDeleteDialogOpen(true);
            }}
            disabled={selectedRequests.length === 0}
            className="flex items-center gap-2 transition-all hover:scale-105"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar Seleccionados ({selectedRequests.length})
          </Button>
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
              variant="outline"
              onClick={exportToExcel}
              disabled={selectedRequests.length === 0}
              className="flex items-center gap-2 transition-all hover:scale-105"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
            <Button
              variant="outline"
              onClick={exportToPDF}
              disabled={selectedRequests.length === 0}
              className="flex items-center gap-2 transition-all hover:scale-105"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
          <Button
            variant="destructive"
            onClick={() => {
              setSelectedRequestId('bulk');
              setIsDeleteDialogOpen(true);
            }}
            disabled={selectedRequests.length === 0}
            className="flex items-center gap-2 transition-all hover:scale-105"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar Seleccionados ({selectedRequests.length})
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center h-[400px] bg-muted/10 rounded-lg">
          <div className="text-center space-y-4">
            <p className="text-2xl font-semibold text-primary">No hay solicitudes</p>
            <p className="text-muted-foreground">
              {view === 'current' 
                ? "No se encontraron solicitudes de compra activas"
                : "No se encontraron solicitudes en el histórico"
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportToExcel}
            disabled={selectedRequests.length === 0}
            className="flex items-center gap-2 transition-all hover:scale-105"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
          <Button
            variant="outline"
            onClick={exportToPDF}
            disabled={selectedRequests.length === 0}
            className="flex items-center gap-2 transition-all hover:scale-105"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
        <Button
          variant="destructive"
          onClick={() => {
            setSelectedRequestId('bulk');
            setIsDeleteDialogOpen(true);
          }}
          disabled={selectedRequests.length === 0}
          className="flex items-center gap-2 transition-all hover:scale-105"
        >
          <Trash2 className="h-4 w-4" />
          Eliminar Seleccionados ({selectedRequests.length})
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar solicitud..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-9 bg-background transition-all focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px] bg-background transition-all hover:bg-accent">
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
            className="flex items-center gap-2 transition-all hover:bg-accent"
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
              {view === 'history' 
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
              {view === 'history' ? 'Eliminar permanentemente' : 'Mover al histórico'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
