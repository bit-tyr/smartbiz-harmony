import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TravelExpenseForm } from "./TravelExpenseForm";
import { TravelExpenseList } from "./TravelExpenseList";

interface TravelRequest {
  id: string;
  destination: string;
  departure_date: string;
  return_date: string;
  purpose: string;
  status: string;
  total_estimated_budget: number;
  currency: string;
}

interface TravelRequestDetailsProps {
  request: TravelRequest | null;
  onClose: () => void;
}

export const TravelRequestDetails = ({ request, onClose }: TravelRequestDetailsProps) => {
  if (!request) return null;

  return (
    <Dialog open={!!request} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalles del Viaje a {request.destination}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Información General</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">Estado</dt>
                  <dd>{request.status}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Destino</dt>
                  <dd>{request.destination}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Fechas</dt>
                  <dd>
                    {format(new Date(request.departure_date), "PPP", { locale: es })} -{" "}
                    {format(new Date(request.return_date), "PPP", { locale: es })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Propósito</dt>
                  <dd>{request.purpose}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Presupuesto Estimado</dt>
                  <dd>
                    {request.currency} {request.total_estimated_budget}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <Tabs defaultValue="expenses" className="w-full">
            <TabsList>
              <TabsTrigger value="expenses">Gastos</TabsTrigger>
              <TabsTrigger value="new-expense">Nuevo Gasto</TabsTrigger>
            </TabsList>
            <TabsContent value="expenses">
              <TravelExpenseList travelRequestId={request.id} />
            </TabsContent>
            <TabsContent value="new-expense">
              <TravelExpenseForm travelRequestId={request.id} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};