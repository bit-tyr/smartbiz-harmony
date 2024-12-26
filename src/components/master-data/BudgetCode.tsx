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

interface BudgetCode {
  id: string;
  code: string;
  description: string;
  created_at: string;
}

export const BudgetCode = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBudgetCode, setSelectedBudgetCode] = useState<BudgetCode | null>(null);
  const [newCode, setNewCode] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const queryClient = useQueryClient();

  const { data: budgetCodes, isLoading } = useQuery({
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

  const handleCreate = async () => {
    try {
      const { error } = await supabase
        .from('budget_codes')
        .insert([{ 
          code: newCode,
          description: newDescription
        }]);

      if (error) {
        console.error('Error detallado:', error);
        if (error.code === '42501') {
          toast.error("No tienes permisos para crear códigos presupuestales");
        } else if (error.code === '23505') {
          toast.error("Ya existe un código presupuestal con ese código");
        } else {
          toast.error(`Error al crear el código presupuestal: ${error.message}`);
        }
        return;
      }

      toast.success("Código presupuestal creado exitosamente");
      queryClient.invalidateQueries({ queryKey: ['budget_codes'] });
      setIsDialogOpen(false);
      setNewCode("");
      setNewDescription("");
    } catch (error) {
      console.error('Error creating budget code:', error);
      toast.error("Error al crear el código presupuestal");
    }
  };

  const handleUpdate = async () => {
    if (!selectedBudgetCode) return;

    try {
      const { error } = await supabase
        .from('budget_codes')
        .update({ 
          code: newCode,
          description: newDescription
        })
        .eq('id', selectedBudgetCode.id);

      if (error) {
        console.error('Error detallado:', error);
        toast.error(`Error al actualizar el código presupuestal: ${error.message}`);
        return;
      }

      toast.success("Código presupuestal actualizado exitosamente");
      queryClient.invalidateQueries({ queryKey: ['budget_codes'] });
      setIsDialogOpen(false);
      setSelectedBudgetCode(null);
      setNewCode("");
      setNewDescription("");
    } catch (error) {
      console.error('Error updating budget code:', error);
      toast.error("Error al actualizar el código presupuestal");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Verificar si hay solicitudes que usan este código presupuestal
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
      queryClient.invalidateQueries({ queryKey: ['budgetCodes'] });
    } catch (error) {
      console.error('Error detallado:', error);
      toast.error("No se puede eliminar el código presupuestal porque está siendo usado en solicitudes de compra");
    }
  };

  const openCreateDialog = () => {
    setSelectedBudgetCode(null);
    setNewCode("");
    setNewDescription("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (budgetCode: BudgetCode) => {
    setSelectedBudgetCode(budgetCode);
    setNewCode(budgetCode.code);
    setNewDescription(budgetCode.description);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (budgetCode: BudgetCode) => {
    setSelectedBudgetCode(budgetCode);
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
          Nuevo Código Presupuestal
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgetCodes?.map((budgetCode) => (
            <TableRow key={budgetCode.id}>
              <TableCell className="font-medium">{budgetCode.code}</TableCell>
              <TableCell>{budgetCode.description}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(budgetCode)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(budgetCode)}
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
              {selectedBudgetCode ? "Editar Código Presupuestal" : "Nuevo Código Presupuestal"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="code">Código</label>
              <Input
                id="code"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Ingrese el código"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description">Descripción</label>
              <Input
                id="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Ingrese la descripción"
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
              onClick={selectedBudgetCode ? handleUpdate : handleCreate}
              disabled={!newCode || !newDescription}
            >
              {selectedBudgetCode ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el código presupuestal
              {selectedBudgetCode?.code && ` "${selectedBudgetCode.code}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(selectedBudgetCode?.id || "")}
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