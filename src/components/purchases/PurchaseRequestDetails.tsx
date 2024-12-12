import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PurchaseRequest } from "./types";

interface PurchaseRequestDetailsProps {
  request: PurchaseRequest | null;
  onClose: () => void;
}

export const PurchaseRequestDetails = ({ request, onClose }: PurchaseRequestDetailsProps) => {
  if (!request) return null;

  return (
    <Dialog open={!!request} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalles de la Solicitud #{request.number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Información General</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">Estado</dt>
                  <dd>{request.status}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Fecha</dt>
                  <dd>{format(new Date(request.created_at), "PPP", { locale: es })}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Laboratorio</dt>
                  <dd>{request.laboratory?.name || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Código Presupuestal</dt>
                  <dd>
                    {request.budget_code ? (
                      <>
                        {request.budget_code.code}
                        <br />
                        <span className="text-sm text-gray-500">
                          {request.budget_code.description}
                        </span>
                      </>
                    ) : "-"}
                  </dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Detalles del Producto</h3>
              {request.purchase_request_items?.[0] && (
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-500">Producto</dt>
                    <dd>{request.purchase_request_items[0].product?.name || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Proveedor</dt>
                    <dd>{request.purchase_request_items[0].product?.supplier?.name || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Cantidad</dt>
                    <dd>{request.purchase_request_items[0].quantity}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Precio Unitario</dt>
                    <dd>
                      {request.purchase_request_items[0].unit_price
                        ? `${request.purchase_request_items[0].currency} ${request.purchase_request_items[0].unit_price}`
                        : "-"}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </div>
          {request.observations && (
            <div>
              <h3 className="font-semibold mb-2">Observaciones</h3>
              <p className="text-gray-700">{request.observations}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};