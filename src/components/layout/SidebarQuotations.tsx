import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, Loader2 } from "lucide-react";
import { useCurrencyRates } from "@/hooks/useCurrencyRates";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Cotizaciones
        </h2>
        <div className="flex justify-center items-center h-[300px]">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !rates?.length) {
    return (
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Cotizaciones
        </h2>
        <div className="px-4 text-center text-sm text-muted-foreground">
          Error al cargar cotizaciones
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        Cotizaciones
      </h2>
      <div className="text-xs text-muted-foreground px-4 mb-2">
        Actualizado: {format(new Date(rates[0]?.fecha || new Date()), "PPp", { locale: es })}
      </div>
      <ScrollArea className="h-[300px]">
        <div className="space-y-2 px-4">
          {rates.map((rate) => (
            <div key={rate.moneda} className="flex items-center justify-between p-2 rounded-lg bg-muted">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>{rate.nombre || rate.moneda}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {formatCurrency(rate.venta)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Compra: {formatCurrency(rate.compra)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};