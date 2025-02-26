
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RequestDetails } from "./form-sections/RequestDetails";
import { ProductDetails } from "./form-sections/ProductDetails";
import { AttachmentSection } from "./form-sections/AttachmentSection";
import { Laboratory, BudgetCode, FormData, Supplier } from "./types";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export interface PurchaseRequestFormProps {
  onSubmit: (values: FormData & { files: File[] }) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
  initialValues?: Partial<FormData>;
  isEditing?: boolean;
  purchaseRequestId?: string;
}

export const PurchaseRequestForm = ({
  onSubmit,
  isSubmitting,
  onCancel,
  initialValues,
  isEditing = false,
  purchaseRequestId
}: PurchaseRequestFormProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userLaboratories, setUserLaboratories] = useState<string[]>([]);
  const [canSelectLaboratory, setCanSelectLaboratory] = useState(false);

  const form = useForm<FormData>({
    defaultValues: initialValues,
    resolver: zodResolver(
      z.object({
        laboratoryId: z.string().min(1, "El laboratorio es requerido"),
        budgetCodeId: z.string().min(1, "El código presupuestal es requerido"),
        supplierId: z.string().min(1, "El proveedor es requerido"),
        productId: z.string().min(1, "El producto es requerido"),
        quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
        unitPrice: z.number().min(0, "El precio unitario debe ser mayor o igual a 0"),
        currency: z.string().min(1, "La moneda es requerida"),
        observations: z.string().optional()
      })
    )
  });

  const { data: laboratories } = useQuery<Laboratory[]>({
    queryKey: ['laboratories'],
    queryFn: async () => {
      let query = supabase
        .from('laboratories')
        .select('id, name, created_at, description')
        .order('name');
      
      if (!canSelectLaboratory && userLaboratories.length > 0) {
        query = query.in('id', userLaboratories);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: canSelectLaboratory || userLaboratories.length > 0
  });

  const { data: budgetCodes } = useQuery<BudgetCode[]>({
    queryKey: ['budgetCodes', form.watch('laboratoryId')],
    queryFn: async () => {
      const laboratoryId = form.watch('laboratoryId');
      if (!laboratoryId) return [];

      const { data, error } = await supabase
        .from('budget_codes')
        .select(`
          id,
          code,
          description,
          created_at,
          laboratory_budget_codes!inner(laboratory_id)
        `)
        .eq('laboratory_budget_codes.laboratory_id', laboratoryId)
        .order('code');

      if (error) throw error;
      return data || [];
    },
    enabled: !!form.watch('laboratoryId')
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <RequestDetails 
        form={form}
        laboratories={laboratories || []}
        budgetCodes={budgetCodes || []}
        userLaboratories={userLaboratories}
        canSelectLaboratory={canSelectLaboratory}
        isEditing={isEditing}
      />
      
      <ProductDetails 
        form={form}
        suppliers={suppliers || []}
      />

      <FormField
        control={form.control}
        name="observations"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observaciones</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Ingrese observaciones adicionales" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {purchaseRequestId && (
        <AttachmentSection
          purchaseRequestId={purchaseRequestId}
          onFilesChange={handleFilesChange}
        />
      )}

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
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
  );
};
