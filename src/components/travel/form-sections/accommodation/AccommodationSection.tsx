import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TravelRequestFormValues } from "../../schemas/travelRequestSchema";

interface AccommodationSectionProps {
  form: UseFormReturn<TravelRequestFormValues>;
}

const formatDateValue = (date: Date | null | undefined) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return ''; // Check if date is valid
    return d.toISOString().split('T')[0];
  } catch (e) {
    console.error('Invalid date:', e);
    return '';
  }
};

export const AccommodationSection = ({ form }: AccommodationSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Alojamiento</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="hotelName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hotel</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="checkIn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha Check-In</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field}
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
          name="checkOut"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha Check-Out</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field}
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
          name="numberOfDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad de Días</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={e => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};