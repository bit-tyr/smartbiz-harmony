import { useState } from "react";
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
  DialogDescription,
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

interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  supplier_id: string;
  created_at: string;
  updated_at: string;
  supplier: {
    id: string;
    name: string;
  };
}

interface Supplier {
  id: string;
  name: string;
}

export const Product = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSupplierId, setNewSupplierId] = useState("");
  const queryClient = useQueryClient();

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          supplier:suppliers (
            id,
            name
          )
        `)
        .order('name');
      
      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Supplier[];
    },
  });

  const handleCreate = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .insert([{ 
          name: newName,
          code: newCode,
          description: newDescription,
          supplier_id: newSupplierId
        }]);

      if (error) {
        console.error('Error detallado:', error);
        if (error.code === '42501') {
          toast.error("No tienes permisos para crear productos");
        } else if (error.code === '23505') {
          toast.error("Ya existe un producto con ese código");
        } else {
          toast.error(`Error al crear el producto: ${error.message}`);
        }
        return;
      }

      toast.success("Producto creado exitosamente");
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error("Error al crear el producto");
    }
  };

  const handleUpdate = async () => {
    if (!selectedProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          name: newName,
          code: newCode,
          description: newDescription,
          supplier_id: newSupplierId
        })
        .eq('id', selectedProduct.id);

      if (error) {
        console.error('Error detallado:', error);
        toast.error(`Error al actualizar el producto: ${error.message}`);
        return;
      }

      toast.success("Producto actualizado exitosamente");
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDialogOpen(false);
      setSelectedProduct(null);
      resetForm();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error("Error al actualizar el producto");
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', selectedProduct.id);

      if (error) {
        console.error('Error detallado:', error);
        toast.error(`Error al eliminar el producto: ${error.message}`);
        return;
      }

      toast.success("Producto eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error("Error al eliminar el producto");
    }
  };

  const resetForm = () => {
    setNewName("");
    setNewCode("");
    setNewDescription("");
    setNewSupplierId("");
  };

  const openCreateDialog = () => {
    setSelectedProduct(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setNewName(product.name);
    setNewCode(product.code);
    setNewDescription(product.description || "");
    setNewSupplierId(product.supplier_id);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  if (isLoadingProducts || isLoadingSuppliers) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products?.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.code}</TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.description || "-"}</TableCell>
              <TableCell>{product.supplier?.name}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(product)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(product)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
            <DialogDescription>
              Complete todos los campos requeridos. La descripción es opcional.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="code">Código</label>
              <Input
                id="code"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Ingrese el código del producto"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="name">Nombre</label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ingrese el nombre del producto"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="supplier">Proveedor</label>
              <Select value={newSupplierId} onValueChange={setNewSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Ingrese la descripción del producto (opcional)"
                className="w-full min-h-[100px] px-3 py-2 border rounded-md"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={selectedProduct ? handleUpdate : handleCreate}
              disabled={!newName || !newCode || !newSupplierId}
            >
              {selectedProduct ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el producto
              {selectedProduct?.name && ` "${selectedProduct.name}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}; 