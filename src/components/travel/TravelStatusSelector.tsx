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
        <SelectItem value="en_proceso">En Proceso</SelectItem>
        <SelectItem value="aprobado">Aprobado</SelectItem>
        <SelectItem value="rechazado">Rechazado</SelectItem>
      </SelectContent>
    </Select>
  );
};