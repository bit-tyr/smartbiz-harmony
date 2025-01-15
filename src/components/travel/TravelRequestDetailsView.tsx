import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TravelRequest } from './types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Briefcase,
  Plane,
  Calendar,
  DollarSign,
  User,
  Info,
  Building,
  Phone,
  Mail,
  FileText,
  Clock,
  MapPin,
  Hotel,
  CreditCard,
  Building2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface TravelRequestDetailsViewProps {
  request: TravelRequest;
}

const TravelRequestDetailsView = ({ request }: TravelRequestDetailsViewProps) => {
  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    return format(new Date(date), "PPP", { locale: es });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return '-';
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: request.currency || 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'aprobado_por_gerente':
        return 'bg-blue-100 text-blue-800';
      case 'aprobado_por_finanzas':
        return 'bg-green-100 text-green-800';
      case 'rechazado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            Solicitud de Viaje
          </CardTitle>
          <Badge className={getStatusColor(request.status)}>
            {request.status?.replace('_', ' ').toUpperCase() || 'PENDIENTE'}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Personal */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-corporate-500" />
                <h3 className="font-semibold">Información Personal</h3>
              </div>
              <Separator />
              <div className="grid gap-3">
                <div>
                  <p className="text-sm text-gray-500">Nombre Completo</p>
                  <p className="font-medium">
                    {request.first_name} {request.last_name} {request.second_last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Documento</p>
                  <p className="font-medium">{request.document_number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                  <p className="font-medium">{formatDate(request.birth_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vencimiento del Documento</p>
                  <p className="font-medium">{formatDate(request.document_expiry)}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <p className="font-medium">{request.phone || '-'}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <p className="font-medium">{request.email || '-'}</p>
                </div>
              </div>
            </section>

            {/* Detalles del Viaje */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-corporate-500" />
                <h3 className="font-semibold">Detalles del Viaje</h3>
              </div>
              <Separator />
              <div className="grid gap-3">
                <div>
                  <p className="text-sm text-gray-500">Destino</p>
                  <div className="flex gap-2 items-center">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <p className="font-medium">{request.destination}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fechas</p>
                  <div className="flex gap-2 items-center">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <p className="font-medium">
                      {formatDate(request.departure_date)} - {formatDate(request.return_date)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Propósito</p>
                  <p className="font-medium">{request.travel_purpose || request.purpose}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Requiere Pasaje</p>
                  <p className="font-medium">{request.needs_passage ? 'Sí' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Requiere Seguro</p>
                  <p className="font-medium">{request.needs_insurance ? 'Sí' : 'No'}</p>
                </div>
                {request.needs_insurance && (
                  <div>
                    <p className="text-sm text-gray-500">Período de Seguro</p>
                    <p className="font-medium">{request.insurance_period || '-'}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Horario Preferido</p>
                  <div className="flex gap-2 items-center">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <p className="font-medium">{request.preferred_schedule || '-'}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Viáticos */}
            {request.requires_allowance && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-corporate-500" />
                  <h3 className="font-semibold">Viáticos</h3>
                </div>
                <Separator />
                <div className="grid gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Monto</p>
                    <p className="font-medium">{formatCurrency(request.allowance_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Banco</p>
                    <div className="flex gap-2 items-center">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <p className="font-medium">{request.bank || '-'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Número de Cuenta</p>
                    <div className="flex gap-2 items-center">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <p className="font-medium">{request.accountNumber || '-'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Titular de la Cuenta</p>
                    <p className="font-medium">{request.accountHolder || '-'}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Alojamiento */}
            {request.hotelName && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Hotel className="h-5 w-5 text-corporate-500" />
                  <h3 className="font-semibold">Alojamiento</h3>
                </div>
                <Separator />
                <div className="grid gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Hotel</p>
                    <p className="font-medium">{request.hotelName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Check-in</p>
                    <p className="font-medium">{formatDate(request.check_in)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Check-out</p>
                    <p className="font-medium">{formatDate(request.check_out)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Número de Días</p>
                    <p className="font-medium">{request.number_of_days || '-'}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Información Adicional */}
            {request.additional_observations && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-corporate-500" />
                  <h3 className="font-semibold">Información Adicional</h3>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-500">Observaciones</p>
                  <p className="font-medium">{request.additional_observations}</p>
                </div>
              </section>
            )}

            {/* Contacto de Emergencia */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-corporate-500" />
                <h3 className="font-semibold">Contacto de Emergencia</h3>
              </div>
              <Separator />
              <div>
                <p className="font-medium">{request.emergency_contact || '-'}</p>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TravelRequestDetailsView;
