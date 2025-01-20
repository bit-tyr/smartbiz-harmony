import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Database } from "@/types/supabase";
import { z } from "zod";
import { Card, CardContent, CardHeader } from '../ui/card';
import { Label } from '../ui/label';
import { useBudgetCodeProducts } from '../../hooks/useBudgetCodeProducts';
import { MultiSelect } from '@/components/ui/multi-select';
import React from "react";

type Tables = Database['public']['Tables'];
type Functions = Database['public']['Functions'];

type BudgetCode = Tables['budget_codes']['Row'];
type Product = Tables['products']['Row'];

type GetBudgetCodeProducts = Functions['get_budget_code_products']['Returns'];
type UpdateBudgetCodeProducts = Functions['update_budget_code_products']['Args'];

const formSchema = z.object({
  code: z.string().min(1, 'El código es requerido'),
  description: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

type Option = {
  value: string;
  label: string;
};

export const BudgetCode = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBudgetCode, setSelectedBudgetCode] = useState<BudgetCode | null>(null);
  const [newCode, setNewCode] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { getProducts, updateProducts } = useBudgetCodeProducts(selectedBudgetCode?.id);

  const { data: budgetCodes, isLoading: isLoadingBudgetCodes } = useQuery({
    queryKey: ['budget_codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_codes')
        .select('*')
        .order('code');
      
      if (error) throw error;
      return data as BudgetCode[];
    },
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          supplier:suppliers (
            name
          )
        `)
        .order('name');
      
      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: selectedProductIds = [] } = useQuery({
    queryKey: ['budget_code_products', selectedBudgetCode?.id],
    enabled: !!selectedBudgetCode,
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_budget_code_product_list', {
          p_budget_code_id: selectedBudgetCode?.id
        });
      
      if (error) throw error;
      return data || [];
    },
  });

  const filteredProducts = React.useMemo(() => {
    if (!products) return [];
    if (!searchTerm) return products;
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) return;

    const values: Database['public']['Tables']['budget_codes']['Insert'] = {
      code: newCode,
      description: newDescription || null
    };

    try {
      const { data: budgetCode, error: createError } = await supabase
        .from('budget_codes')
        .insert(values)
        .select()
        .single();

      if (createError) throw createError;

      if (selectedProducts.length > 0) {
        const { error: updateError } = await supabase
          .rpc('update_budget_code_products', {
            p_budget_code_id: budgetCode.id,
            p_product_ids: selectedProducts
          });

        if (updateError) throw updateError;
      }

      toast.success('El código de presupuesto se ha creado correctamente.');

      queryClient.invalidateQueries({ queryKey: ['budget_codes'] });
      queryClient.invalidateQueries({ queryKey: ['budget_code_products'] });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating budget code:', error);
      toast.error('Ocurrió un error al crear el código de presupuesto.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBudgetCode || !newCode) return;

    const values = {
      code: newCode,
      description: newDescription || null
    };

    try {
      const { error: updateError } = await supabase
        .from('budget_codes')
        .update(values)
        .eq('id', selectedBudgetCode.id);

      if (updateError) throw updateError;

      const { error: productsError } = await supabase
        .rpc('update_budget_code_products', {
          p_budget_code_id: selectedBudgetCode.id,
          p_product_ids: selectedProducts
        });

      if (productsError) throw productsError;

      toast.success('El código de presupuesto se ha actualizado correctamente.');

      queryClient.invalidateQueries({ queryKey: ['budget_codes'] });
      queryClient.invalidateQueries({ queryKey: ['budget_code_products'] });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error updating budget code:', error);
      toast.error('Ocurrió un error al actualizar el código de presupuesto.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { data: requests, error: checkError } = await supabase
        .from('purchase_requests')
        .select('id')
        .eq('budget_code_id', id);

      if (checkError) throw checkError;

      if (requests && requests.length > 0) {
        toast.error("No se puede eliminar el código presupuestal porque está siendo usado en solicitudes de compra");
        return;
      }

      const { error } = await supabase
        .from('budget_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Código presupuestal eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: ['budget_codes'] });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting budget code:', error);
      toast.error("Error al eliminar el código presupuestal");
    }
  };

  const resetForm = () => {
    setNewCode("");
    setNewDescription("");
    setSelectedProducts([]);
    setSelectedBudgetCode(null);
  };

  const handleEdit = (budgetCode: BudgetCode) => {
    setSelectedBudgetCode(budgetCode);
    setNewCode(budgetCode.code);
    setNewDescription(budgetCode.description || "");
    setIsDialogOpen(true);

    // Cargar productos asociados
    const loadProducts = async () => {
      const { data, error } = await supabase
        .rpc('get_budget_code_product_list', {
          p_budget_code_id: budgetCode.id
        });
      
      if (error) {
        console.error('Error loading products:', error);
        return;
      }
      
      if (data) {
        setSelectedProducts(data);
      }
    };

    loadProducts();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedBudgetCode) {
      await handleUpdate(e);
    } else {
      await handleCreate(e);
    }
  };

  useEffect(() => {
    if (!isDialogOpen) {
      resetForm();
    }
  }, [isDialogOpen]);

  useEffect(() => {
    if (selectedBudgetCode?.id && selectedProductIds?.length > 0) {
      setSelectedProducts(selectedProductIds);
    }
  }, [selectedBudgetCode?.id, selectedProductIds]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Códigos Presupuestales</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Código
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingBudgetCodes ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : budgetCodes?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No hay códigos presupuestales registrados
                </TableCell>
              </TableRow>
            ) : (
              budgetCodes?.map((budgetCode) => (
                <TableRow key={budgetCode.id}>
                  <TableCell>{budgetCode.code}</TableCell>
                  <TableCell>{budgetCode.description}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(budgetCode)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedBudgetCode(budgetCode);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedBudgetCode ? "Editar" : "Nuevo"} Código Presupuestal
            </DialogTitle>
          </DialogHeader>
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">
                {selectedBudgetCode ? 'Editar' : 'Nuevo'} Código Presupuestal
              </h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="products">Productos Asociados</Label>
                  <div className="border rounded-md p-4 space-y-2 max-h-60 overflow-y-auto">
                    <div className="mb-2">
                      <Input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={product.id}
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedProducts([...selectedProducts, product.id]);
                            } else {
                              setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={product.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {product.name}
                        </label>
                      </div>
                    ))}
                    {filteredProducts.length === 0 && (
                      <div className="text-center text-sm text-gray-500 py-2">
                        No se encontraron productos
                      </div>
                    )}
                  </div>
                </div>
                <Button type="submit">
                  {selectedBudgetCode ? 'Actualizar' : 'Crear'}
                </Button>
              </form>
            </CardContent>
          </Card>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDialogOpen(false);
              resetForm();
            }}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el código presupuestal
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setSelectedBudgetCode(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedBudgetCode && handleDelete(selectedBudgetCode.id)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}; 