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
import { FormData, Laboratory, BudgetCode } from "../types";
import { useEffect } from "react";

export interface RequestDetailsProps {
  form: UseFormReturn<FormData>;
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

  // Si el usuario solo tiene un laboratorio asignado, seleccionarlo automáticamente
  useEffect(() => {
    if (!canSelectLaboratory && userLaboratories.length === 1) {
      form.setValue('laboratoryId', userLaboratories[0]);
    }
  }, [userLaboratories, canSelectLaboratory, form]);

  // Limpiar el código presupuestal cuando cambia el laboratorio
  useEffect(() => {
    form.setValue('budgetCodeId', '');
  }, [selectedLaboratoryId, form]);

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
                  {budgetCodes.map((budgetCode) => (
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
