import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

interface FormsTabProps {
  onNewRequest: () => void;
}

export const FormsTab = ({ onNewRequest }: FormsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Formularios de Solicitudes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={onNewRequest}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Compras
          </Button>
          <Button variant="outline" className="justify-start">
            Inscripción
          </Button>
          <Button variant="outline" className="justify-start">
            Pasajes/Viáticos/Alojamiento
          </Button>
          <Button variant="outline" className="justify-start">
            Publicación
          </Button>
          <Button variant="outline" className="justify-start">
            Suscripción
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};