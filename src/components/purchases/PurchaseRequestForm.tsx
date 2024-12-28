import { useForm } from "react-hook-form";
import {
  Form,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FormSection } from "./form-sections/FormSection";
import { RequestDetails } from "./form-sections/RequestDetails";
import { ProductDetails } from "./form-sections/ProductDetails";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AttachmentSection } from "./form-sections/AttachmentSection";
import { useState } from "react";

export interface FormValues {
  laboratoryId: string;
  budgetCodeId: string;
  supplierId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  observations?: string;
  files?: File[];
}

interface PurchaseRequestFormProps {
  onSubmit: (values: FormValues & { files: File[] }) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
  initialValues?: FormValues;
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
  const form = useForm<FormValues>({
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

  const handleSubmit = async (values: FormValues) => {
    await onSubmit({ ...values, files: selectedFiles });
  };

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files);
  };

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

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <RequestDetails 
          form={form}
          laboratories={laboratories}
          budgetCodes={budgetCodes}
        />
        
        <ProductDetails
          form={form}
          suppliers={suppliers}
          products={products}
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
    </Form>
  );
};