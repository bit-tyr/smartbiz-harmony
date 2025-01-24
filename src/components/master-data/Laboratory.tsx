import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Settings } from "lucide-react";
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
import { Database } from "@/types/database.types";
import { LaboratoryBudgetCodesDialog } from "@/components/laboratories/LaboratoryBudgetCodesDialog";

type Tables = Database['public']['Tables'];
type Laboratory = Tables['laboratories']['Row'];
type BudgetCode = Tables['budget_codes']['Row'];
type LaboratoryBudgetCode = Tables['laboratory_budget_codes']['Row'];

const supabaseTyped = supabase as any;

export const Laboratory = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBudgetCodesOpen, setIsBudgetCodesOpen] = useState(false);
  const [selectedLaboratory, setSelectedLaboratory] = useState<Laboratory | null>(null);
  const [selectedBudgetCodes, setSelectedBudgetCodes] = useState<string[]>([]);

  const { data: laboratories } = useQuery({
    queryKey: ["laboratories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("laboratories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Error al cargar los laboratorios");
        return [];
      }

      return data as Laboratory[];
    },
  });

  const { data: budgetCodes } = useQuery({
    queryKey: ["budget_codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budget_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Error al cargar los códigos presupuestarios");
        return [];
      }

      return data as BudgetCode[];
    },
  });

  const { data: laboratoryBudgetCodes } = useQuery({
    queryKey: ["laboratory_budget_codes"],
    queryFn: async () => {
      const { data, error } = await supabaseTyped
        .from("laboratory_budget_codes")
        .select("*");

      if (error) {
        toast.error("Error al cargar las relaciones entre laboratorios y códigos presupuestarios");
        return [];
      }

      return data as LaboratoryBudgetCode[];
    },
  });

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;

    const { data: laboratory, error } = await supabase
      .from("laboratories")
      .insert([{ name, code }])
      .select()
      .single();

    if (error) {
      toast.error("Error al crear el laboratorio");
      return;
    }

    // Crear las relaciones con los códigos presupuestarios seleccionados
    if (selectedBudgetCodes.length > 0) {
      const { error: relationError } = await supabaseTyped
        .from("laboratory_budget_codes")
        .insert(
          selectedBudgetCodes.map((budgetCodeId) => ({
            laboratory_id: laboratory.id,
            budget_code_id: budgetCodeId,
          }))
        );

      if (relationError) {
        toast.error("Error al crear las relaciones con los códigos presupuestarios");
        return;
      }
    }

    queryClient.invalidateQueries({ queryKey: ["laboratories"] });
    queryClient.invalidateQueries({ queryKey: ["laboratory_budget_codes"] });
    setIsOpen(false);
    setSelectedBudgetCodes([]);
    toast.success("Laboratorio creado exitosamente");
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedLaboratory) return;

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;

    const { error } = await supabase
      .from("laboratories")
      .update({ name, code })
      .eq("id", selectedLaboratory.id);

    if (error) {
      toast.error("Error al actualizar el laboratorio");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["laboratories"] });
    setIsOpen(false);
    setSelectedLaboratory(null);
    toast.success("Laboratorio actualizado exitosamente");
  };

  const handleDelete = async () => {
    if (!selectedLaboratory) return;

    const { error } = await supabase
      .from("laboratories")
      .delete()
      .eq("id", selectedLaboratory.id);

    if (error) {
      toast.error("Error al eliminar el laboratorio");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["laboratories"] });
    setIsDeleteOpen(false);
    setSelectedLaboratory(null);
    toast.success("Laboratorio eliminado exitosamente");
  };

  const handleEdit = (laboratory: Laboratory) => {
    setSelectedLaboratory(laboratory);
    // Cargar los códigos presupuestales asociados al laboratorio
    const associatedBudgetCodes = laboratoryBudgetCodes
      ?.filter((lbc) => lbc.laboratory_id === laboratory.id)
      .map((lbc) => lbc.budget_code_id);
    setSelectedBudgetCodes(associatedBudgetCodes || []);
    setIsOpen(true);
  };

  const handleBudgetCodesChange = async (budgetCodes: string[]) => {
    if (!selectedLaboratory) return;

    // Eliminar las relaciones existentes
    const { error: deleteError } = await supabaseTyped
      .from("laboratory_budget_codes")
      .delete()
      .eq("laboratory_id", selectedLaboratory.id);

    if (deleteError) {
      toast.error("Error al eliminar las relaciones con los códigos presupuestarios");
      return;
    }

    // Crear las nuevas relaciones
    if (budgetCodes.length > 0) {
      const { error: relationError } = await supabaseTyped
        .from("laboratory_budget_codes")
        .insert(
          budgetCodes.map((budgetCodeId) => ({
            laboratory_id: selectedLaboratory.id,
            budget_code_id: budgetCodeId,
          }))
        );

      if (relationError) {
        toast.error("Error al crear las relaciones con los códigos presupuestarios");
        return;
      }
    }

    queryClient.invalidateQueries({ queryKey: ["laboratory_budget_codes"] });
    setSelectedBudgetCodes(budgetCodes);
    toast.success("Códigos presupuestales actualizados exitosamente");
  };

  const handleOpenBudgetCodes = (laboratory: Laboratory) => {
    setSelectedLaboratory(laboratory);
    const associatedBudgetCodes = laboratoryBudgetCodes
      ?.filter((lbc) => lbc.laboratory_id === laboratory.id)
      .map((lbc) => lbc.budget_code_id);
    setSelectedBudgetCodes(associatedBudgetCodes || []);
    setIsBudgetCodesOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Laboratorios</h2>
        <Button onClick={() => {
          setSelectedLaboratory(null);
          setSelectedBudgetCodes([]);
          setIsOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Laboratorio
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {laboratories?.map((laboratory) => (
            <TableRow key={laboratory.id}>
              <TableCell>{laboratory.code}</TableCell>
              <TableCell>{laboratory.name}</TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(laboratory)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedLaboratory(laboratory);
                    setIsDeleteOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenBudgetCodes(laboratory)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedLaboratory ? "Editar Laboratorio" : "Nuevo Laboratorio"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={selectedLaboratory ? handleUpdate : handleCreate}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="code">Código</label>
                <Input
                  id="code"
                  name="code"
                  defaultValue={selectedLaboratory?.code}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="name">Nombre</label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={selectedLaboratory?.name}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {selectedLaboratory ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el laboratorio
              y todas sus relaciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LaboratoryBudgetCodesDialog
        isOpen={isBudgetCodesOpen}
        onClose={() => setIsBudgetCodesOpen(false)}
        selectedBudgetCodes={selectedBudgetCodes}
        onBudgetCodesChange={handleBudgetCodesChange}
        availableBudgetCodes={budgetCodes || []}
      />
    </div>
  );
}; 