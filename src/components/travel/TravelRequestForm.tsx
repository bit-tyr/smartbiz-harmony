import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { LaboratoryBudgetSection } from "./form-sections/LaboratoryBudgetSection";
import { DateSection } from "./form-sections/DateSection";
import { travelRequestSchema, TravelRequestFormValues } from "./schemas/travelRequestSchema";
import { TravelAttachmentSection } from "./form-sections/AttachmentSection";
import { useState } from "react";

interface TravelRequestFormProps {
  onSubmit: (values: TravelRequestFormValues & { files: File[] }) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
  travelRequestId?: string;
}

export const TravelRequestForm = ({
  onSubmit,
  isSubmitting,
  onCancel,
  travelRequestId
}: TravelRequestFormProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const form = useForm<TravelRequestFormValues>({
    resolver: zodResolver(travelRequestSchema),
    defaultValues: {
      currency: 'USD',
    },
  });

  const handleSubmit = async (values: TravelRequestFormValues) => {
    await onSubmit({ ...values, files: selectedFiles });
  };

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <LaboratoryBudgetSection form={form} />
        
        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destino</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ciudad, País" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DateSection form={form} />

        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Propósito del Viaje</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Describa el propósito del viaje" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalEstimatedBudget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Presupuesto Estimado</FormLabel>
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

        {travelRequestId && (
          <TravelAttachmentSection
            travelRequestId={travelRequestId}
            onFilesChange={handleFilesChange}
          />
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};