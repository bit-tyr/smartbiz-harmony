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
import { toast } from "sonner";

interface Supplier {
  id: string;
  name: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export const Supplier = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [newName, setNewName] = useState("");
  const [newRuc, setNewRuc] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const queryClient = useQueryClient();

  const { data: suppliers, isLoading } = useQuery({
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
        .from('suppliers')
        .insert([{ 
          name: newName,
          ruc: newRuc,
          address: newAddress,
          phone: newPhone,
          email: newEmail
        }]);

      if (error) {
        console.error('Error detallado:', error);
        if (error.code === '42501') {
          toast.error("No tienes permisos para crear proveedores");
        } else if (error.code === '23505') {
          toast.error("Ya existe un proveedor con ese RUC");
        } else {
          toast.error(`Error al crear el proveedor: ${error.message}`);
        }
        return;
      }

      toast.success("Proveedor creado exitosamente");
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating supplier:', error);
      toast.error("Error al crear el proveedor");
    }
  };

  const handleUpdate = async () => {
    if (!selectedSupplier) return;

    try {
      const { error } = await supabase
        .from('suppliers')
        .update({ 
          name: newName,
          ruc: newRuc,
          address: newAddress,
          phone: newPhone,
          email: newEmail
        })
        .eq('id', selectedSupplier.id);

      if (error) {
        console.error('Error detallado:', error);
        toast.error(`Error al actualizar el proveedor: ${error.message}`);
        return;
      }

      toast.success("Proveedor actualizado exitosamente");
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setIsDialogOpen(false);
      setSelectedSupplier(null);
      resetForm();
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast.error("Error al actualizar el proveedor");
    }
  };

  const handleDelete = async () => {
    if (!selectedSupplier) return;

    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', selectedSupplier.id);

      if (error) {
        console.error('Error detallado:', error);
        toast.error(`Error al eliminar el proveedor: ${error.message}`);
        return;
      }

      toast.success("Proveedor eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setIsDeleteDialogOpen(false);
      setSelectedSupplier(null);
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast.error("Error al eliminar el proveedor");
    }
  };

  const resetForm = () => {
    setNewName("");
    setNewRuc("");
    setNewAddress("");
    setNewPhone("");
    setNewEmail("");
  };

  const openCreateDialog = () => {
    setSelectedSupplier(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setNewName(supplier.name);
    setNewRuc(supplier.ruc);
    setNewAddress(supplier.address);
    setNewPhone(supplier.phone);
    setNewEmail(supplier.email);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>RUC</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers?.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell>{supplier.ruc}</TableCell>
              <TableCell>{supplier.address}</TableCell>
              <TableCell>{supplier.phone}</TableCell>
              <TableCell>{supplier.email}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(supplier)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(supplier)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name">Nombre</label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ingrese el nombre del proveedor"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="ruc">RUC</label>
              <Input
                id="ruc"
                value={newRuc}
                onChange={(e) => setNewRuc(e.target.value)}
                placeholder="Ingrese el RUC"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="address">Dirección</label>
              <Input
                id="address"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Ingrese la dirección"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone">Teléfono</label>
              <Input
                id="phone"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Ingrese el teléfono"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Ingrese el email"
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
              onClick={selectedSupplier ? handleUpdate : handleCreate}
              disabled={!newName || !newRuc}
            >
              {selectedSupplier ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el proveedor
              {selectedSupplier?.name && ` "${selectedSupplier.name}"`}.
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