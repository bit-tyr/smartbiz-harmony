import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusConfig, TravelRequestStatus } from "./config/statusConfig";

interface TravelStatusSelectorProps {
  status: TravelRequestStatus;
  onStatusChange: (status: TravelRequestStatus) => void;
  disabled: boolean;
}

export const TravelStatusSelector = ({
  status,
  onStatusChange,
  disabled
}: TravelStatusSelectorProps) => {
  return (
    <Select
      value={status}
      onValueChange={(value: TravelRequestStatus) => onStatusChange(value)}
      disabled={disabled}
    >
      <SelectTrigger className={`w-[200px] ${statusConfig[status]?.className}`}>
        <SelectValue>
          {statusConfig[status]?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pendiente">Pendiente</SelectItem>
        <SelectItem value="aprobado_por_gerente">Aprobado por Gerente</SelectItem>
        <SelectItem value="aprobado_por_finanzas">Aprobado por Finanzas</SelectItem>
        <SelectItem value="rechazado">Rechazado</SelectItem>
        <SelectItem value="completado">Completado</SelectItem>
      </SelectContent>
    </Select>
  );
};