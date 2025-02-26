import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PurchaseRequest } from "../types";
import React from "react";

interface PurchaseRequestDetailsProps {
  request: PurchaseRequest | null;
  onClose: () => void;
}

const PurchaseRequestDetails: React.FC<PurchaseRequestDetailsProps> = ({
  request,
  onClose
}) => {
  const statusConfig = {
    pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    in_process: { label: "En Proceso", className: "bg-blue-100 text-blue-800 border-blue-200" },
    purchased: { label: "Comprado", className: "bg-green-100 text-green-800 border-green-200" },
    ready_for_delivery: { label: "Listo para Entrega", className: "bg-purple-100 text-purple-800 border-purple-200" },
    delivered: { label: "Entregado", className: "bg-gray-100 text-gray-800 border-gray-200" }
  };

  return (
    <Dialog open={!!request} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalles de la Solicitud</DialogTitle>
        </DialogHeader>
        {request && (
          <div className="space-y-4">
            {/* Update references from profiles to profile */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Solicitante</Label>
                <div className="font-medium">
                  {request.profile?.first_name} {request.profile?.last_name}
                </div>
              </div>
              <div>
                <Label>Laboratorio</Label>
                <div className="font-medium">{request.laboratory?.name}</div>
              </div>
              <div>
                <Label>Código Presupuestal</Label>
                <div className="font-medium">
                  {request.budget_code?.code} - {request.budget_code?.description}
                </div>
              </div>
              <div>
                <Label>Estado</Label>
                <Badge className={statusConfig[request.status]?.className}>
                  {statusConfig[request.status]?.label}
                </Badge>
              </div>
            </div>
            <div>
              <Label>Observaciones</Label>
              <div className="font-medium">{request.observations}</div>
            </div>
            <div>
              <Label>Items</Label>
              <ul>
                {request.purchase_request_items?.map((item) => (
                  <li key={item.id} className="py-2 border-b last:border-b-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Producto</Label>
                        <div className="font-medium">{item.product?.name}</div>
                      </div>
                      <div>
                        <Label>Proveedor</Label>
                        <div className="font-medium">{item.product?.supplier?.name}</div>
                      </div>
                      <div>
                        <Label>Cantidad</Label>
                        <div className="font-medium">{item.quantity}</div>
                      </div>
                      <div>
                        <Label>Precio Unitario</Label>
                        <div className="font-medium">
                          {item.currency} {item.unit_price}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseRequestDetails;
