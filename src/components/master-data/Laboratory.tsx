import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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

type Tables = Database['public']['Tables'];
type Laboratory = Tables['laboratories']['Row'];
type BudgetCode = Tables['budget_codes']['Row'];
type LaboratoryBudgetCode = Tables['laboratory_budget_codes']['Row'];

const supabaseTyped = supabase as any;

export const Laboratory = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedLaboratory, setSelectedLaboratory] = useState<Laboratory | null>(
    null
  );
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
        toast.error(
          "Error al cargar las relaciones entre laboratorios y códigos presupuestarios"
        );
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
        toast.error(
          "Error al crear las relaciones con los códigos presupuestarios"
        );
        return;
      }
    }

    // Eliminar las relaciones existentes
    const { error: deleteError } = await supabaseTyped
      .from("laboratory_budget_codes")
      .delete()
      .eq("laboratory_id", selectedLaboratory.id);

    if (deleteError) {
      toast.error(
        "Error al eliminar las relaciones con los códigos presupuestarios"
      );
      return;
    }

    // Crear las nuevas relaciones
    if (selectedBudgetCodes.length > 0) {
      const { error: relationError } = await supabaseTyped
        .from("laboratory_budget_codes")
        .insert(
          selectedBudgetCodes.map((budgetCodeId) => ({
            laboratory_id: selectedLaboratory.id,
            budget_code_id: budgetCodeId,
          }))
        );

      if (relationError) {
        toast.error(
          "Error al crear las relaciones con los códigos presupuestarios"
        );
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

    // Eliminar las relaciones existentes
    const { error: deleteError } = await supabaseTyped
      .from("laboratory_budget_codes")
      .delete()
      .eq("laboratory_id", selectedLaboratory.id);

    if (deleteError) {
      toast.error(
        "Error al eliminar las relaciones con los códigos presupuestarios"
      );
      return;
    }

    // Crear las nuevas relaciones
    if (selectedBudgetCodes.length > 0) {
      const { error: relationError } = await supabaseTyped
        .from("laboratory_budget_codes")
        .insert(
          selectedBudgetCodes.map((budgetCodeId) => ({
            laboratory_id: selectedLaboratory.id,
            budget_code_id: budgetCodeId,
          }))
        );

      if (relationError) {
        toast.error(
          "Error al crear las relaciones con los códigos presupuestarios"
        );
        return;
      }
    }

    queryClient.invalidateQueries({ queryKey: ["laboratories"] });
    queryClient.invalidateQueries({ queryKey: ["laboratory_budget_codes"] });
    setIsOpen(false);
    setSelectedLaboratory(null);
    setSelectedBudgetCodes([]);
    toast.success("Laboratorio actualizado exitosamente");
  };

  const handleDelete = async () => {
    if (!selectedLaboratory) return;

    // Eliminar las relaciones primero
    const { error: relationError } = await supabaseTyped
      .from("laboratory_budget_codes")
      .delete()
      .eq("laboratory_id", selectedLaboratory.id);

    if (relationError) {
      toast.error(
        "Error al eliminar las relaciones con los códigos presupuestarios"
      );
      return;
    }

    const { error } = await supabase
      .from("laboratories")
      .delete()
      .eq("id", selectedLaboratory.id);

    if (error) {
      toast.error("Error al eliminar el laboratorio");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["laboratories"] });
    queryClient.invalidateQueries({ queryKey: ["laboratory_budget_codes"] });
    setIsDeleteOpen(false);
    setSelectedLaboratory(null);
    toast.success("Laboratorio eliminado exitosamente");
  };

  const handleEdit = (laboratory: Laboratory) => {
    setSelectedLaboratory(laboratory);
    // Obtener los códigos presupuestarios asociados al laboratorio
    const associatedBudgetCodes =
      laboratoryBudgetCodes?.filter(
        (relation) => relation.laboratory_id === laboratory.id
      ) || [];
    setSelectedBudgetCodes(
      associatedBudgetCodes.map((relation) => relation.budget_code_id)
    );
    setIsOpen(true);
  };

  const handleCheckboxChange = (budgetCodeId: string) => {
    setSelectedBudgetCodes((prev) =>
      prev.includes(budgetCodeId)
        ? prev.filter((id) => id !== budgetCodeId)
        : [...prev, budgetCodeId]
    );
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Laboratorios</h2>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Códigos Presupuestarios</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {laboratories?.map((laboratory) => (
            <TableRow key={laboratory.id}>
              <TableCell>{laboratory.code}</TableCell>
              <TableCell>{laboratory.name}</TableCell>
              <TableCell>
                {laboratoryBudgetCodes
                  ?.filter(
                    (relation) => relation.laboratory_id === laboratory.id
                  )
                  .map((relation) => {
                    const budgetCode = budgetCodes?.find(
                      (code) => code.id === relation.budget_code_id
                    );
                    return budgetCode?.code;
                  })
                  .join(", ")}
              </TableCell>
              <TableCell className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(laboratory)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setSelectedLaboratory(laboratory);
                    setIsDeleteOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
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
              {selectedLaboratory
                ? "Editar Laboratorio"
                : "Agregar Nuevo Laboratorio"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={selectedLaboratory ? handleUpdate : handleCreate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="code" className="text-right">
                  Código
                </label>
                <Input
                  id="code"
                  name="code"
                  defaultValue={selectedLaboratory?.code}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  Nombre
                </label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={selectedLaboratory?.name}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <label className="text-right">
                  Códigos Presupuestarios
                </label>
                <div className="col-span-3 space-y-2">
                  {budgetCodes?.map((budgetCode) => (
                    <div key={budgetCode.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={budgetCode.id}
                        checked={selectedBudgetCodes.includes(budgetCode.id)}
                        onCheckedChange={() => handleCheckboxChange(budgetCode.id)}
                      />
                      <label htmlFor={budgetCode.id}>
                        {budgetCode.code} - {budgetCode.description}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
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
              Esta acción no se puede deshacer. Esto eliminará permanentemente el
              laboratorio y sus relaciones con los códigos presupuestarios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}; 