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
        <SelectItem value="pending">Pendiente</SelectItem>
        <SelectItem value="in_process">En Proceso</SelectItem>
        <SelectItem value="purchased">Comprado</SelectItem>
        <SelectItem value="ready_for_delivery">Listo para Entrega</SelectItem>
        <SelectItem value="delivered">Entregado</SelectItem>
        <SelectItem value="rejected">Rechazado</SelectItem>
      </SelectContent>
    </Select>
  );
};