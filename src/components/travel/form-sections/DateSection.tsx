import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { TravelRequestFormValues } from "../schemas/travelRequestSchema";

interface DateSectionProps {
  form: UseFormReturn<TravelRequestFormValues>;
}

export const DateSection = ({ form }: DateSectionProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="departureDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fecha de Salida</FormLabel>
            <FormControl>
              <Input {...field} type="date" />
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
              <Input {...field} type="date" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};