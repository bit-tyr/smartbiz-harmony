export type TravelRequestStatus = "pending" | "in_process" | "purchased" | "ready_for_delivery" | "delivered" | "rejected";

export const statusConfig: Record<TravelRequestStatus, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
  in_process: { label: "En Proceso", className: "bg-blue-100 text-blue-800" },
  purchased: { label: "Comprado", className: "bg-green-100 text-green-800" },
  ready_for_delivery: { label: "Listo para Entrega", className: "bg-purple-100 text-purple-800" },
  delivered: { label: "Entregado", className: "bg-gray-100 text-gray-800" },
  rejected: { label: "Rechazado", className: "bg-red-100 text-red-800" }
};