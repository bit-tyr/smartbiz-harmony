import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { TravelRequestFormValues } from "../schemas/travelRequestSchema";

interface TravelDetailsSectionProps {
  form: UseFormReturn<TravelRequestFormValues>;
}

const formatDateValue = (date: Date | null | undefined): string => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

export const TravelDetailsSection = ({ form }: TravelDetailsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Detalles del Viaje</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Origen y Destino</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ciudad, País" value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="travelPurpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo del Viaje</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="departureDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de Partida</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  value={formatDateValue(field.value)}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    field.onChange(date);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="returnDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de Retorno</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  value={formatDateValue(field.value)}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    field.onChange(date);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="needsPassage"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Requiere Pasaje</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="needsInsurance"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Requiere Seguro</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emergencyContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contacto de Emergencia</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="preferredSchedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horario de Preferencia</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};