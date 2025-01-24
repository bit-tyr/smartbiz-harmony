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
import { Database } from "@/types/database.types";

type Tables = Database['public']['Tables'];
type Laboratory = Tables['laboratories']['Row'];
type BudgetCode = Tables['budget_codes']['Row'];
type Supplier = Tables['suppliers']['Row'];
type LaboratoryUser = Tables['laboratory_users']['Row'];

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
  const [userLaboratories, setUserLaboratories] = useState<string[]>([]);
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

  // Obtener el rol y laboratorios del usuario
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Obtener el perfil del usuario
        const { data: profile } = await supabase
          .from('profiles')
          .select('role_id')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          // Obtener el rol
          const { data: role } = await supabase
            .from('roles')
            .select('name')
            .eq('id', profile.role_id)
            .single();

          if (role?.name) {
            setUserRole(role.name);
            // Los usuarios con rol 'admin' o 'purchases' pueden seleccionar cualquier laboratorio
            const canSelect = role.name === 'admin' || role.name === 'purchases';
            setCanSelectLaboratory(canSelect);

            if (!canSelect) {
              // Obtener los laboratorios asignados al usuario
              const { data: laboratoryUsers } = await supabase
                .from('laboratories')
                .select(`
                  id,
                  laboratory_users!inner(user_id)
                `)
                .eq('laboratory_users.user_id', user.id)
                .returns<Array<{ id: string; laboratory_users: Array<{ user_id: string }> }>>();

              if (laboratoryUsers) {
                const laboratoryIds = laboratoryUsers.map(lu => lu.id);
                setUserLaboratories(laboratoryIds);
                
                // Si solo hay un laboratorio asignado, seleccionarlo automáticamente
                if (laboratoryIds.length === 1) {
                  form.setValue('laboratoryId', laboratoryIds[0]);
                }
              }
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

  const { data: laboratories } = useQuery<Laboratory[]>({
    queryKey: ['laboratories'],
    queryFn: async () => {
      let query = supabase
        .from('laboratories')
        .select('*')
        .order('name');
      
      // Si el usuario no es admin ni purchases, filtrar solo los laboratorios asignados
      if (!canSelectLaboratory && userLaboratories.length > 0) {
        query = query.in('id', userLaboratories);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: canSelectLaboratory || userLaboratories.length > 0
  });

  const { data: budgetCodes } = useQuery<BudgetCode[]>({
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

  const { data: suppliers } = useQuery<Supplier[]>({
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
    </Form>
  );
};