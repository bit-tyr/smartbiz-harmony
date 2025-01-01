import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TravelRequestForm } from '@/components/travel/TravelRequestForm';
import { TravelRequestList } from '@/components/travel/TravelRequestList';
import { TravelRequestView } from '@/components/travel/TravelRequestView';
import { TravelDashboard } from '@/components/travel/TravelDashboard';
import type { TravelRequestWithDetails } from '@/types/travel';

export default function Viajes() {
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TravelRequestWithDetails | null>(null);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Solicitudes de Viaje</h1>
        <Button onClick={() => setShowForm(true)}>
          Nueva Solicitud
        </Button>
      </div>

      <div className="mb-6">
        <TravelDashboard />
      </div>

      <Tabs defaultValue="solicitudes" className="w-full">
        <TabsList>
          <TabsTrigger value="solicitudes">Solicitudes</TabsTrigger>
          <TabsTrigger value="formularios">Formularios</TabsTrigger>
          <TabsTrigger value="faq">Preguntas Frecuentes</TabsTrigger>
        </TabsList>

        <TabsContent value="solicitudes">
          <TravelRequestList
            onRequestSelect={setSelectedRequest}
          />
        </TabsContent>

        <TabsContent value="formularios">
          <div className="grid gap-4">
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-semibold mb-2">Formulario de Solicitud de Viaje</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete este formulario para solicitar la aprobación de un viaje, incluyendo pasajes, alojamiento y viáticos.
              </p>
              <Button onClick={() => setShowForm(true)}>
                Completar Formulario
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="faq">
          <div className="grid gap-4">
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-semibold mb-2">¿Cómo solicito un viaje?</h3>
              <p className="text-sm text-muted-foreground">
                Para solicitar un viaje, haga clic en el botón "Nueva Solicitud" y complete el formulario con los detalles del viaje, incluyendo destino, fechas, propósito y gastos estimados.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-semibold mb-2">¿Cuál es el proceso de aprobación?</h3>
              <p className="text-sm text-muted-foreground">
                Las solicitudes de viaje siguen un proceso de aprobación que incluye:
              </p>
              <ol className="list-decimal list-inside mt-2 text-sm text-muted-foreground">
                <li>Revisión y aprobación por el gerente directo</li>
                <li>Revisión y aprobación por el departamento de finanzas</li>
                <li>Notificación al solicitante del estado de la solicitud</li>
              </ol>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-semibold mb-2">¿Qué documentos necesito adjuntar?</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Dependiendo del tipo de viaje, puede necesitar adjuntar:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li>Invitación al evento o conferencia</li>
                <li>Itinerario preliminar</li>
                <li>Cotizaciones de pasajes o alojamiento</li>
                <li>Otros documentos relevantes</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {showForm && (
        <TravelRequestForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
          }}
        />
      )}

      {selectedRequest && (
        <TravelRequestView
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
} 