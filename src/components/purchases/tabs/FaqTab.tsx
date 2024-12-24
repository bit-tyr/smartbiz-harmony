import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const FaqTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preguntas Frecuentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pregunta..."
            className="pl-8 mb-4"
          />
        </div>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No hay preguntas frecuentes disponibles en este momento.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};