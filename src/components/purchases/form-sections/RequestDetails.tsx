import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../PurchaseRequestForm";
import { Database } from "@/types/database.types";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Tables = Database['public']['Tables'];
type Laboratory = Tables['laboratories']['Row'];
type BudgetCode = Tables['budget_codes']['Row'];

export interface RequestDetailsProps {
  form: UseFormReturn<FormValues>;
  laboratories: Laboratory[];
  budgetCodes: BudgetCode[];
  userLaboratories: string[];
  canSelectLaboratory: boolean;
  isEditing: boolean;
}

export const RequestDetails = ({
  form,
  laboratories,
  budgetCodes,
  userLaboratories,
  canSelectLaboratory,
  isEditing
}: RequestDetailsProps) => {
  const selectedLaboratoryId = form.watch("laboratoryId");

  // Obtener los códigos presupuestales asociados al laboratorio seleccionado
  const { data: laboratoryBudgetCodes = [] } = useQuery({
    queryKey: ['laboratoryBudgetCodes', selectedLaboratoryId],
    queryFn: async () => {
      if (!selectedLaboratoryId) return [];
      
      const { data, error } = await supabase
        .from('laboratories')
        .select(`
          laboratory_budget_codes:laboratory_budget_codes(budget_code_id)
        `)
        .eq('id', selectedLaboratoryId)
        .returns<Array<{ laboratory_budget_codes: Array<{ budget_code_id: string }> }>>();

      if (error) throw error;
      const budgetCodes = data?.[0]?.laboratory_budget_codes || [];
      return budgetCodes;
    },
    enabled: !!selectedLaboratoryId
  });

  // Filtrar los códigos presupuestales según el laboratorio seleccionado
  const filteredBudgetCodes = budgetCodes.filter(code => 
    laboratoryBudgetCodes.some(lbc => lbc.budget_code_id === code.id)
  );

  // Si el usuario solo tiene un laboratorio asignado, seleccionarlo automáticamente
  useEffect(() => {
    if (!canSelectLaboratory && userLaboratories.length === 1) {
      form.setValue('laboratoryId', userLaboratories[0]);
    }
  }, [userLaboratories, canSelectLaboratory, form]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="laboratoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Laboratorio</FormLabel>
            <FormControl>
              <Select
                onValueChange={field.onChange}
                value={field.value || ''}
                disabled={!canSelectLaboratory && userLaboratories.length === 1}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un laboratorio" />
                </SelectTrigger>
                <SelectContent>
                  {laboratories.map((laboratory) => (
                    <SelectItem key={laboratory.id} value={laboratory.id}>
                      {laboratory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
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
            <FormControl>
              <Select
                onValueChange={field.onChange}
                value={field.value || ''}
                disabled={!selectedLaboratoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedLaboratoryId ? "Selecciona un código presupuestal" : "Primero selecciona un laboratorio"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredBudgetCodes.map((budgetCode) => (
                    <SelectItem key={budgetCode.id} value={budgetCode.id}>
                      {budgetCode.code} - {budgetCode.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};