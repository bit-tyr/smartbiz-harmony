import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface TravelExpenseListProps {
  travelRequestId: string;
}

export const TravelExpenseList = ({ travelRequestId }: TravelExpenseListProps) => {
  const { data: expenses, isLoading } = useQuery({
    queryKey: ['travelExpenses', travelRequestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('travel_expenses')
        .select('*')
        .eq('travel_request_id', travelRequestId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const downloadReceipt = async (receiptPath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('travel-receipts')
        .download(receiptPath);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar recibo:', error);
      toast.error("Error al descargar el recibo");
    }
  };

  if (isLoading) {
    return <div>Cargando gastos...</div>;
  }

  const getExpenseTypeLabel = (type: string) => {
    const types = {
      transportation: 'Transporte',
      accommodation: 'Alojamiento',
      meals: 'Comidas',
      other: 'Otro',
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Recibo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses?.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>{getExpenseTypeLabel(expense.expense_type)}</TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell>
                {expense.currency} {expense.estimated_amount}
              </TableCell>
              <TableCell>{expense.status}</TableCell>
              <TableCell>
                {expense.receipt_path && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadReceipt(expense.receipt_path, `recibo-${expense.id}`)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {(!expenses || expenses.length === 0) && (
        <div className="text-center text-muted-foreground py-4">
          No hay gastos registrados
        </div>
      )}
    </div>
  );
};