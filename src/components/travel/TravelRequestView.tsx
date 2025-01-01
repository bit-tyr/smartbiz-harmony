import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getUserRole } from '@/utils/auth';
import type { TravelRequestWithDetails } from '@/types/travel';

const statusMap = {
  pendiente: { label: 'Pendiente', variant: 'default' },
  aprobado_por_gerente: { label: 'Aprobado por Gerente', variant: 'warning' },
  aprobado_por_finanzas: { label: 'Aprobado por Finanzas', variant: 'success' },
  rechazado: { label: 'Rechazado', variant: 'destructive' },
  completado: { label: 'Completado', variant: 'secondary' },
} as const;

const expenseTypeMap = {
  pasaje_aereo: 'Pasaje Aéreo',
  alojamiento: 'Alojamiento',
  viaticos: 'Viáticos',
  transporte_local: 'Transporte Local',
  otros: 'Otros',
} as const;

interface TravelRequestViewProps {
  request: TravelRequestWithDetails;
  onClose: () => void;
}

export function TravelRequestView({ request, onClose }: TravelRequestViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [isPurchasesUser, setIsPurchasesUser] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      const role = await getUserRole();
      setIsPurchasesUser(role?.isPurchasesUser ?? false);
    };

    checkUserRole();
  }, []);

  const canApprove = isPurchasesUser && request.status === 'pendiente';

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No hay sesión de usuario');

      const { data, error } = await supabase
        .rpc('approve_travel_request', {
          request_id: request.id,
          approver_id: session.user.id,
          notes: notes
        });

      if (error) throw error;
      onClose();
    } catch (error) {
      console.error('Error al aprobar la solicitud:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!notes) {
      alert('Por favor ingrese un motivo para el rechazo');
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('travel_requests')
        .update({
          status: 'rechazado',
          manager_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (error) throw error;
      onClose();
    } catch (error) {
      console.error('Error al rechazar la solicitud:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data } = await supabase.storage
        .from('travel-attachments')
        .createSignedUrl(filePath, 3600);

      if (!data?.signedUrl) throw new Error('No se pudo obtener la URL del archivo');

      const a = document.createElement('a');
      a.href = data.signedUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles de la Solicitud de Viaje</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Estado
              </h4>
              <Badge variant={statusMap[request.status].variant as any}>
                {statusMap[request.status].label}
              </Badge>
            </div>
            {request.manager_notes && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Notas del Gerente
                </h4>
                <p className="text-sm">{request.manager_notes}</p>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              Destino
            </h4>
            <p>{request.destination}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Fecha de Salida
              </h4>
              <p>
                {format(new Date(request.departure_date), 'PPP', { locale: es })}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Fecha de Regreso
              </h4>
              <p>
                {format(new Date(request.return_date), 'PPP', { locale: es })}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              Propósito del Viaje
            </h4>
            <p className="whitespace-pre-wrap">{request.purpose}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              Gastos Estimados
            </h4>
            <div className="space-y-2">
              {request.expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex justify-between items-center p-2 bg-muted/30 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {expenseTypeMap[expense.expense_type]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {expense.description}
                    </p>
                  </div>
                  <p>
                    {new Intl.NumberFormat('es-PY', {
                      style: 'currency',
                      currency: expense.currency,
                    }).format(expense.estimated_amount)}
                  </p>
                </div>
              ))}
              <div className="flex justify-between items-center p-2 bg-primary/10 rounded-lg font-medium">
                <p>Total</p>
                <p>
                  {new Intl.NumberFormat('es-PY', {
                    style: 'currency',
                    currency: request.currency,
                  }).format(request.total_estimated_budget)}
                </p>
              </div>
            </div>
          </div>

          {request.attachments?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Archivos Adjuntos
              </h4>
              <div className="space-y-2">
                {request.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex justify-between items-center p-2 bg-muted/30 rounded-lg"
                  >
                    <p className="text-sm">{attachment.file_name}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleDownload(attachment.file_path, attachment.file_name)
                      }
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {canApprove && (
            <div className="space-y-4">
              <Textarea
                placeholder="Notas (opcional para aprobación, requerido para rechazo)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isSubmitting || !notes}
                >
                  Rechazar
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                >
                  Aprobar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 