import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TravelRequestFormValues } from "../schemas/travelRequestSchema";

interface PersonalInfoSectionProps {
  form: UseFormReturn<TravelRequestFormValues>;
}

const formatDateValue = (date: Date | null | undefined): string => {
  if (!date) return '';
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date value:', date);
      return '';
    }
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const PersonalInfoSection = ({ form }: PersonalInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Datos Personales</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primer Nombre</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primer Apellido</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="documentNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Documento</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de Nacimiento</FormLabel>
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
          name="documentExpiry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vencimiento de Documento</FormLabel>
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
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input {...field} type="tel" value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};