import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import type { TravelRequestWithDetails } from '@/types/travel';

export function TravelDashboard() {
  const { data: requests } = useQuery<TravelRequestWithDetails[]>({
    queryKey: ['travelRequests'],
    queryFn: async (): Promise<TravelRequestWithDetails[]> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No hay sesión de usuario');
      }

      const { data, error } = await supabase
        .from('travel_requests')
        .select(`
          *,
          laboratory:laboratories(id, name),
          project:projects!left(id, name),
          requester:profiles!travel_requests_user_id_fkey(id, email),
          expenses:travel_expenses(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TravelRequestWithDetails[];
    }
  });

  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: es });
  
  const stats = {
    totalRequests: requests?.length || 0,
    pendingRequests: requests?.filter(r => r.status === 'pendiente').length || 0,
    approvedRequests: requests?.filter(r => ['aprobado_por_gerente', 'aprobado_por_finanzas'].includes(r.status)).length || 0,
    totalBudget: requests?.reduce((total, r) => total + r.total_estimated_budget, 0) || 0,
    monthlyRequests: requests?.filter(r => 
      format(new Date(r.created_at), 'MMMM yyyy', { locale: es }) === currentMonth
    ).length || 0,
    monthlyBudget: requests?.filter(r => 
      format(new Date(r.created_at), 'MMMM yyyy', { locale: es }) === currentMonth
    ).reduce((total, r) => total + r.total_estimated_budget, 0) || 0,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Solicitudes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRequests}</div>
          <p className="text-xs text-muted-foreground">
            {stats.monthlyRequests} este mes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Solicitudes Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingRequests}</div>
          <p className="text-xs text-muted-foreground">
            {stats.approvedRequests} aprobadas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Presupuesto Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('es-UY', {
              style: 'currency',
              currency: 'USD',
            }).format(stats.totalBudget)}
          </div>
          <p className="text-xs text-muted-foreground">
            {new Intl.NumberFormat('es-UY', {
              style: 'currency',
              currency: 'USD',
            }).format(stats.monthlyBudget)} este mes
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 