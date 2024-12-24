import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PurchaseRequest } from "../types";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PurchaseRequestTableRowProps {
  request: PurchaseRequest;
  visibleColumns: Record<string, boolean>;
  onClick?: () => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  userRole?: string | null;
}

const statusConfig = {
  pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  in_process: { label: "En Proceso", className: "bg-blue-100 text-blue-800 border-blue-200" },
  purchased: { label: "Comprado", className: "bg-green-100 text-green-800 border-green-200" },
  ready_for_delivery: { label: "Listo para Entrega", className: "bg-purple-100 text-purple-800 border-purple-200" },
  delivered: { label: "Entregado", className: "bg-gray-100 text-gray-800 border-gray-200" }
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const PurchaseRequestTableRow = ({ 
  request, 
  visibleColumns,
  onClick,
  onDelete,
  onStatusChange,
  userRole
}: PurchaseRequestTableRowProps) => {
  const firstItem = request.purchase_request_items?.[0];

  console.log('Request:', request);
  console.log('First Item:', firstItem);

  const handleStatusChange = async (newStatus: string) => {
    if (onStatusChange) {
      try {
        // Obtener la sesión del usuario actual
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error("No hay sesión de usuario");

        // Obtener el nombre del usuario que realiza el cambio
        const { data: userProfile, error: userError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', session.user.id)
          .single();

        if (userError) throw userError;

        const userName = `${userProfile.first_name} ${userProfile.last_name}`;
        const oldStatus = statusConfig[request.status as keyof typeof statusConfig]?.label;
        const newStatusLabel = statusConfig[newStatus as keyof typeof statusConfig]?.label;

        // Crear notificación si el usuario actual no es el creador
        if (session.user.id !== request.user_id) {
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              user_id: request.user_id,
              purchase_request_id: request.id,
              title: `Estado de solicitud #${request.number} actualizado`,
              message: `${userName} ha cambiado el estado de tu solicitud de "${oldStatus}" a "${newStatusLabel}"`,
              read: false
            });

          if (notificationError) {
            console.error('Error creating notification:', notificationError);
          }
        }

        onStatusChange(request.id, newStatus);
      } catch (error) {
        console.error('Error handling status change:', error);
        toast.error("Error al actualizar el estado");
      }
    }
  };

  return (
    <TableRow 
      key={request.id} 
      className="cursor-pointer hover:bg-gray-50"
      onClick={onClick}
    >
      {visibleColumns.number && (
        <TableCell className="font-medium">#{request.number}</TableCell>
      )}
      {visibleColumns.laboratory && (
        <TableCell>{request.laboratory?.name || "-"}</TableCell>
      )}
      {visibleColumns.budgetCode && (
        <TableCell>
          {request.budget_code ? (
            <div>
              <div className="font-medium">{request.budget_code.code}</div>
              <div className="text-sm text-gray-500">
                {request.budget_code.description}
              </div>
            </div>
          ) : "-"}
        </TableCell>
      )}
      {visibleColumns.product && (
        <TableCell>{firstItem?.product?.name || "-"}</TableCell>
      )}
      {visibleColumns.supplier && (
        <TableCell>{firstItem?.product?.supplier?.name || "-"}</TableCell>
      )}
      {visibleColumns.quantity && (
        <TableCell>{firstItem?.quantity || "-"}</TableCell>
      )}
      {visibleColumns.unitPrice && (
        <TableCell>
          {firstItem?.unit_price && firstItem?.currency ? 
            formatCurrency(firstItem.unit_price, firstItem.currency) : 
            "-"
          }
        </TableCell>
      )}
      {visibleColumns.currency && (
        <TableCell>{firstItem?.currency || "-"}</TableCell>
      )}
      {visibleColumns.status && (
        <TableCell onClick={(e) => e.stopPropagation()}>
          {userRole === 'user' ? (
            <Badge 
              variant="outline" 
              className={statusConfig[request.status as keyof typeof statusConfig]?.className || ""}
            >
              {statusConfig[request.status as keyof typeof statusConfig]?.label || request.status}
            </Badge>
          ) : (
            <Select
              value={request.status}
              onValueChange={(value) => handleStatusChange(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue>
                  <Badge 
                    variant="outline" 
                    className={statusConfig[request.status as keyof typeof statusConfig]?.className || ""}
                  >
                    {statusConfig[request.status as keyof typeof statusConfig]?.label || request.status}
                  </Badge>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>
                    <Badge 
                      variant="outline" 
                      className={statusConfig[value as keyof typeof statusConfig]?.className}
                    >
                      {label}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </TableCell>
      )}
      {visibleColumns.date && (
        <TableCell>
          {format(new Date(request.created_at), "PPP", { locale: es })}
        </TableCell>
      )}
      {visibleColumns.observations && (
        <TableCell>{request.observations || "-"}</TableCell>
      )}
      {visibleColumns.creator && (
        <TableCell>
          {request.profiles?.first_name && request.profiles?.last_name ? 
            `${request.profiles.first_name} ${request.profiles.last_name}` : 
            "-"
          }
        </TableCell>
      )}
      <TableCell>
        <div className="flex gap-2">
          {userRole !== 'user' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(request.id);
              }}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Eliminar</span>
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};