import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Download, FileSpreadsheet, FileText, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getUserRole } from '@/utils/auth';
import type { TravelRequestWithDetails } from '@/types/travel';
import { utils, writeFileXLSX } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const statusMap = {
  pendiente: { label: 'Pendiente', variant: 'default' },
  aprobado_por_gerente: { label: 'Aprobado por Gerente', variant: 'warning' },
  aprobado_por_finanzas: { label: 'Aprobado por Finanzas', variant: 'success' },
  rechazado: { label: 'Rechazado', variant: 'destructive' },
  completado: { label: 'Completado', variant: 'secondary' },
} as const;

interface TravelRequestListProps {
  onRequestSelect: (request: TravelRequestWithDetails) => void;
}

export function TravelRequestList({ onRequestSelect }: TravelRequestListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['travelRequests'],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          throw new Error('No hay sesión de usuario');
        }

        const role = await getUserRole();
        const query = supabase
          .from('travel_requests')
          .select(`
            *,
            laboratory:laboratories(id, name),
            project:projects!left(id, name),
            requester:profiles!travel_requests_user_id_fkey(id, email, first_name, last_name),
            manager:profiles!travel_requests_manager_id_fkey(id, email, first_name, last_name),
            finance_approver:profiles!travel_requests_finance_approver_id_fkey(id, email, first_name, last_name),
            expenses:travel_expenses(*),
            attachments:travel_attachments(*)
          `)
          .order('created_at', { ascending: false });

        if (!role?.isPurchasesUser) {
          query.eq('user_id', session.user.id);
        }

        const { data, error } = await query;

        if (error) throw error;

        const typedData = data as unknown as Array<Omit<TravelRequestWithDetails, 'project'> & { project: any }>;
        return typedData.map(request => ({
          ...request,
          project: request.project?.id ? request.project : null
        })) as TravelRequestWithDetails[];
      } catch (error) {
        console.error('Error al cargar las solicitudes:', error);
        throw error;
      }
    },
  });

  const filteredRequests = requests?.filter(request => {
    const matchesSearch = 
      request.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.laboratory.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || statusFilter === 'todos' || request.status === statusFilter;
    
    const matchesDate = !dateFilter || (
      format(new Date(request.departure_date), 'yyyy-MM') === dateFilter
    );

    return matchesSearch && matchesStatus && matchesDate;
  });

  const exportToExcel = () => {
    if (!filteredRequests?.length) return;

    const data = filteredRequests.map(request => ({
      'Destino': request.destination,
      'Laboratorio': request.laboratory.name,
      'Fecha Salida': format(new Date(request.departure_date), 'PPP', { locale: es }),
      'Fecha Regreso': format(new Date(request.return_date), 'PPP', { locale: es }),
      'Estado': statusMap[request.status].label,
      'Presupuesto': new Intl.NumberFormat('es-UY', {
        style: 'currency',
        currency: request.currency,
      }).format(request.total_estimated_budget),
      'Solicitante': request.requester.email
    }));

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Solicitudes');
    writeFileXLSX(wb, 'solicitudes_viaje.xlsx');
  };

  const exportToPDF = () => {
    if (!filteredRequests?.length) return;

    const doc = new jsPDF();
    doc.text('Solicitudes de Viaje', 14, 15);

    const tableData = filteredRequests.map(request => [
      request.destination,
      request.laboratory.name,
      format(new Date(request.departure_date), 'PPP', { locale: es }),
      statusMap[request.status].label,
      new Intl.NumberFormat('es-UY', {
        style: 'currency',
        currency: request.currency,
      }).format(request.total_estimated_budget)
    ]);

    (doc as any).autoTable({
      head: [['Destino', 'Laboratorio', 'Fecha Salida', 'Estado', 'Presupuesto']],
      body: tableData,
      startY: 20,
    });

    doc.save('solicitudes_viaje.pdf');
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error al cargar las solicitudes de viaje</p>
        <p className="text-sm text-muted-foreground mt-2">
          {error instanceof Error ? error.message : 'Error desconocido'}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-12 bg-muted/50 animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por destino o laboratorio..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            {Object.entries(statusMap).map(([value, { label }]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="month"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-[180px]"
        />
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={exportToExcel}>
            <FileSpreadsheet className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={exportToPDF}>
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!filteredRequests?.length ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay solicitudes de viaje que coincidan con los filtros</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Destino</TableHead>
                <TableHead>Laboratorio</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Presupuesto</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.destination}</TableCell>
                  <TableCell>{request.laboratory.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        Salida: {format(new Date(request.departure_date), 'PPP', { locale: es })}
                      </div>
                      <div className="text-sm">
                        Regreso: {format(new Date(request.return_date), 'PPP', { locale: es })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusMap[request.status].variant as any}>
                      {statusMap[request.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('es-UY', {
                      style: 'currency',
                      currency: request.currency,
                    }).format(request.total_estimated_budget)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRequestSelect(request)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 