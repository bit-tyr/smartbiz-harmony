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
import { useState, useEffect } from "react";

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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userLaboratory, setUserLaboratory] = useState<string | null>(null);
  const [canSelectLaboratory, setCanSelectLaboratory] = useState(false);

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

  // Obtener el rol y laboratorio del usuario
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        console.log('Getting user info for:', user.id);

        // Obtener el perfil del usuario
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('laboratory_id, role_id')
          .eq('user_id', user.id)
          .single();

        console.log('Profile data:', profile);
        console.log('Profile error:', profileError);

        if (profile) {
          // Obtener el rol
          const { data: role, error: roleError } = await supabase
            .from('roles')
            .select('name')
            .eq('id', profile.role_id)
            .single();

          console.log('Role data:', role);
          console.log('Role error:', roleError);

          if (role?.name) {
            setUserRole(role.name);
            // Los usuarios con rol 'admin' o 'purchases' pueden seleccionar cualquier laboratorio
            const canSelect = role.name === 'admin' || role.name === 'purchases';
            console.log('Role name:', role.name);
            console.log('Can select laboratory:', canSelect);
            setCanSelectLaboratory(canSelect);

            // Si es un usuario regular, establecer y bloquear su laboratorio
            if (!canSelect && profile.laboratory_id) {
              console.log('Setting user laboratory:', profile.laboratory_id);
              setUserLaboratory(profile.laboratory_id);
              form.setValue('laboratoryId', profile.laboratory_id);
            }
          }
        }
      } catch (error) {
        console.error('Error getting user info:', error);
      }
    };

    getUserInfo();
  }, [form]);

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
          laboratories={laboratories || []}
          budgetCodes={budgetCodes || []}
          userLaboratory={userLaboratory}
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
    </Form>
  );
};