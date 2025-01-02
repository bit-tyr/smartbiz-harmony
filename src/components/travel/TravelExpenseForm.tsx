import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";

const expenseSchema = z.object({
  expenseType: z.enum(['transportation', 'accommodation', 'meals', 'other']),
  description: z.string().min(1, "La descripción es requerida"),
  estimatedAmount: z.string().min(1, "El monto es requerido"),
  currency: z.string().min(1, "La moneda es requerida"),
});

interface TravelExpenseFormProps {
  travelRequestId: string;
  onSuccess?: () => void;
}

export const TravelExpenseForm = ({ travelRequestId, onSuccess }: TravelExpenseFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expenseType: 'transportation',
      description: '',
      estimatedAmount: '',
      currency: 'USD',
    },
  });

  const onSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);

      if (selectedFile) {
        const sanitizedName = selectedFile.name.replace(/[^\x00-\x7F]/g, '');
        const filePath = `${travelRequestId}/${crypto.randomUUID()}-${sanitizedName}`;

        const { error: uploadError } = await supabase.storage
          .from('travel-receipts')
          .upload(filePath, selectedFile);

        if (uploadError) {
          toast.error("Error al subir el recibo");
          return;
        }

        values.receiptPath = filePath;
      }

      const { error } = await supabase
        .from('travel_expenses')
        .insert({
          travel_request_id: travelRequestId,
          expense_type: values.expenseType,
          description: values.description,
          estimated_amount: Number(values.estimatedAmount),
          currency: values.currency,
          receipt_path: values.receiptPath,
        });

      if (error) throw error;

      toast.success("Gasto agregado exitosamente");
      form.reset();
      setSelectedFile(null);
      onSuccess?.();
    } catch (error) {
      console.error('Error al crear gasto:', error);
      toast.error("Error al crear el gasto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="expenseType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Gasto</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo de gasto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="transportation">Transporte</SelectItem>
                  <SelectItem value="accommodation">Alojamiento</SelectItem>
                  <SelectItem value="meals">Comidas</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Describa el gasto" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="estimatedAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto Estimado</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" min="0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moneda</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione la moneda" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="PEN">PEN</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Recibo (opcional)</FormLabel>
          <Input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Agregar Gasto
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};