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

interface Laboratory {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export const Laboratory = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLaboratory, setSelectedLaboratory] = useState<Laboratory | null>(null);
  const [newLaboratoryName, setNewLaboratoryName] = useState("");
  const queryClient = useQueryClient();

  const { data: laboratories, isLoading } = useQuery({
    queryKey: ['laboratories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('laboratories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Laboratory[];
    },
  });

  const handleCreate = async () => {
    try {
      const { error } = await supabase
        .from('laboratories')
        .insert([{ 
          name: newLaboratoryName,
          code: newLaboratoryName.toUpperCase().replace(/\s+/g, '_')
        }]);

      if (error) {
        console.error('Error detallado:', error);
        if (error.code === '42501') {
          toast.error("No tienes permisos para crear laboratorios");
        } else if (error.code === '23505') {
          toast.error("Ya existe un laboratorio con ese código");
        } else {
          toast.error(`Error al crear el laboratorio: ${error.message}`);
        }
        return;
      }

      toast.success("Laboratorio creado exitosamente");
      queryClient.invalidateQueries({ queryKey: ['laboratories'] });
      setIsDialogOpen(false);
      setNewLaboratoryName("");
    } catch (error) {
      console.error('Error creating laboratory:', error);
      toast.error("Error al crear el laboratorio");
    }
  };

  const handleUpdate = async () => {
    if (!selectedLaboratory) return;

    try {
      const { error } = await supabase
        .from('laboratories')
        .update({ 
          name: newLaboratoryName,
          code: newLaboratoryName.toUpperCase().replace(/\s+/g, '_')
        })
        .eq('id', selectedLaboratory.id);

      if (error) throw error;

      toast.success("Laboratorio actualizado exitosamente");
      queryClient.invalidateQueries({ queryKey: ['laboratories'] });
      setIsDialogOpen(false);
      setSelectedLaboratory(null);
      setNewLaboratoryName("");
    } catch (error) {
      console.error('Error updating laboratory:', error);
      toast.error("Error al actualizar el laboratorio");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Verificar si hay solicitudes que usan este laboratorio
      const { data: requests, error: checkError } = await supabase
        .from('purchase_requests')
        .select('id')
        .eq('laboratory_id', id);

      if (checkError) throw checkError;

      if (requests && requests.length > 0) {
        toast.error("No se puede eliminar el laboratorio porque está siendo usado en solicitudes de compra");
        return;
      }

      const { error } = await supabase
        .from('laboratories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Laboratorio eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: ['laboratories'] });
    } catch (error) {
      console.error('Error detallado:', error);
      toast.error("No se puede eliminar el laboratorio porque está siendo usado en solicitudes de compra");
    }
  };

  const openCreateDialog = () => {
    setSelectedLaboratory(null);
    setNewLaboratoryName("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (laboratory: Laboratory) => {
    setSelectedLaboratory(laboratory);
    setNewLaboratoryName(laboratory.name);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (laboratory: Laboratory) => {
    setSelectedLaboratory(laboratory);
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
          Nuevo Laboratorio
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {laboratories?.map((laboratory) => (
            <TableRow key={laboratory.id}>
              <TableCell>{laboratory.name}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(laboratory)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(laboratory)}
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
              {selectedLaboratory ? "Editar Laboratorio" : "Nuevo Laboratorio"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name">Nombre</label>
              <Input
                id="name"
                value={newLaboratoryName}
                onChange={(e) => setNewLaboratoryName(e.target.value)}
                placeholder="Nombre del laboratorio"
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
              onClick={selectedLaboratory ? handleUpdate : handleCreate}
              disabled={!newLaboratoryName}
            >
              {selectedLaboratory ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el laboratorio
              {selectedLaboratory?.name && ` "${selectedLaboratory.name}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(selectedLaboratory?.id || '')}
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