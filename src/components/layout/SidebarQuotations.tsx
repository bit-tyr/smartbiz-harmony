import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { useCurrencyRates } from "@/hooks/useCurrencyRates";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card } from "@/components/ui/card";

const formatCurrency = (value: number | null) => {
  if (value === null || isNaN(value)) return '-';
  return value.toLocaleString('es-UY', { 
    style: 'currency', 
    currency: 'UYU',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const SidebarQuotations = () => {
  const { data: rates, isLoading, error } = useCurrencyRates();

  if (isLoading) {
    return (
      <div className="px-2 py-2 w-[250px]">
        <h2 className="mb-2 px-3 text-xl font-bold tracking-tight text-primary">
          Cotizaciones
        </h2>
        <div className="flex justify-center items-center h-[250px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !rates?.length) {
    return (
      <div className="px-2 py-2 w-[250px]">
        <h2 className="mb-2 px-3 text-xl font-bold tracking-tight text-primary">
          Cotizaciones
        </h2>
        <div className="px-3 text-center text-base text-muted-foreground">
          Error al cargar cotizaciones
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 py-2 w-[250px]">
      <div className="flex items-center justify-between mb-2 px-3">
        <h2 className="text-xl font-bold tracking-tight text-primary">
          Cotizaciones
        </h2>
        <DollarSign className="h-6 w-6 text-primary" />
      </div>
      <div className="text-xs text-muted-foreground px-3 mb-2">
        Actualizado: {format(new Date(rates[0]?.fecha || new Date()), "PPp", { locale: es })}
      </div>
      <ScrollArea className="h-[250px] px-1">
        <div className="space-y-3">
          {rates.map((rate) => (
            <Card key={rate.moneda} className="p-3 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-card to-background border-l-4 border-primary">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-base font-bold text-primary">{rate.nombre || rate.moneda}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="flex items-center space-x-1 mb-1">
                    <ArrowDown className="h-4 w-4 text-red-500" />
                    <span className="text-muted-foreground font-medium">Compra</span>
                  </div>
                  <div className="font-bold text-base text-red-500">
                    {formatCurrency(rate.compra)}
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="flex items-center space-x-1 mb-1">
                    <ArrowUp className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground font-medium">Venta</span>
                  </div>
                  <div className="font-bold text-base text-green-500">
                    {formatCurrency(rate.venta)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}