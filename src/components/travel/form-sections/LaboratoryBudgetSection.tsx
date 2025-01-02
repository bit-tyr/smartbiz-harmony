import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { TravelRequestFormValues } from "../schemas/travelRequestSchema";

interface LaboratoryBudgetSectionProps {
  form: UseFormReturn<TravelRequestFormValues>;
}

export const LaboratoryBudgetSection = ({ form }: LaboratoryBudgetSectionProps) => {
  const { data: laboratories } = useQuery({
    queryKey: ['laboratories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('laboratories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: budgetCodes } = useQuery({
    queryKey: ['budgetCodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_codes')
        .select('*')
        .order('code');
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="laboratoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Laboratorio</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un laboratorio" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {laboratories?.map((lab) => (
                  <SelectItem key={lab.id} value={lab.id}>
                    {lab.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="budgetCodeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Código Presupuestal</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un código" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {budgetCodes?.map((code) => (
                  <SelectItem key={code.id} value={code.id}>
                    {code.code} - {code.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};