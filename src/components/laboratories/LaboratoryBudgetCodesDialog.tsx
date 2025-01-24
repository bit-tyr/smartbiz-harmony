import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database } from "@/types/database.types";

type BudgetCode = Database["public"]["Tables"]["budget_codes"]["Row"];

interface LaboratoryBudgetCodesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBudgetCodes: string[];
  onBudgetCodesChange: (budgetCodes: string[]) => void;
  availableBudgetCodes: BudgetCode[];
}

export const LaboratoryBudgetCodesDialog = ({
  isOpen,
  onClose,
  selectedBudgetCodes,
  onBudgetCodesChange,
  availableBudgetCodes,
}: LaboratoryBudgetCodesDialogProps) => {
  const [localSelectedCodes, setLocalSelectedCodes] = useState<string[]>([]);

  useEffect(() => {
    setLocalSelectedCodes(selectedBudgetCodes);
  }, [selectedBudgetCodes]);

  const handleCheckboxChange = (budgetCodeId: string) => {
    setLocalSelectedCodes((prev) => {
      if (prev.includes(budgetCodeId)) {
        return prev.filter((id) => id !== budgetCodeId);
      } else {
        return [...prev, budgetCodeId];
      }
    });
  };

  const handleSave = () => {
    onBudgetCodesChange(localSelectedCodes);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Seleccionar Códigos Presupuestales</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {availableBudgetCodes.map((budgetCode) => (
              <div
                key={budgetCode.id}
                className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-md"
              >
                <Checkbox
                  id={budgetCode.id}
                  checked={localSelectedCodes.includes(budgetCode.id)}
                  onCheckedChange={() => handleCheckboxChange(budgetCode.id)}
                />
                <label
                  htmlFor={budgetCode.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                >
                  <div>{budgetCode.code}</div>
                  <div className="text-sm text-gray-500">
                    {budgetCode.description}
                  </div>
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 