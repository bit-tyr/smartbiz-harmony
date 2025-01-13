export type TravelRequestStatus = 'pendiente' | 'aprobado_por_gerente' | 'aprobado_por_finanzas' | 'rechazado' | 'completado';

export const statusConfig = {
  pendiente: {
    label: "Pendiente",
    className: "bg-yellow-100 text-yellow-800"
  },
  aprobado_por_gerente: {
    label: "Aprobado por Gerente",
    className: "bg-blue-100 text-blue-800"
  },
  aprobado_por_finanzas: {
    label: "Aprobado por Finanzas",
    className: "bg-green-100 text-green-800"
  },
  rechazado: {
    label: "Rechazado", 
    className: "bg-red-100 text-red-800"
  },
  completado: {
    label: "Completado",
    className: "bg-purple-100 text-purple-800"
  }
};