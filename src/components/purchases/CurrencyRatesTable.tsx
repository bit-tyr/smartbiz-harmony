import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrencyRates } from "@/hooks/useCurrencyRates";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2 } from "lucide-react";

export const CurrencyRatesTable = () => {
  const { data: rates, isLoading, error } = useCurrencyRates();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error al cargar las cotizaciones
      </div>
    );
  }

  if (!rates?.length) {
    return (
      <div className="text-center text-gray-500 p-4">
        No hay cotizaciones disponibles
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Moneda</TableHead>
            <TableHead className="text-right">Compra</TableHead>
            <TableHead className="text-right">Venta</TableHead>
            <TableHead className="text-right">Última Actualización</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rates.map((rate) => (
            <TableRow key={rate.moneda}>
              <TableCell className="font-medium">
                {rate.nombre}
              </TableCell>
              <TableCell className="text-right">
                {rate.compra.toLocaleString('es-UY', { 
                  style: 'currency', 
                  currency: 'UYU' 
                })}
              </TableCell>
              <TableCell className="text-right">
                {rate.venta.toLocaleString('es-UY', { 
                  style: 'currency', 
                  currency: 'UYU' 
                })}
              </TableCell>
              <TableCell className="text-right">
                {format(new Date(rate.fecha), "PPp", { locale: es })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 