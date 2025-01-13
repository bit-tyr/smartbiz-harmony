export type TravelRequestStatus = 'pendiente' | 'en_proceso' | 'aprobado' | 'rechazado';

export const statusConfig = {
  pendiente: {
    label: "Pendiente",
    className: "bg-yellow-100 text-yellow-800"
  },
  en_proceso: {
    label: "En Proceso",
    className: "bg-blue-100 text-blue-800"
  },
  aprobado: {
    label: "Aprobado",
    className: "bg-green-100 text-green-800"
  },
  rechazado: {
    label: "Rechazado", 
    className: "bg-red-100 text-red-800"
  }
};