import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading";

interface CreateTravelRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTravelRequestDialog = ({
  open,
  onOpenChange
}: CreateTravelRequestDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    destination: "",
    purpose: "",
    description: "",
    laboratory_id: "",
    budget_code_id: ""
  });

  const { data: laboratories } = useQuery({
    queryKey: ['laboratories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('laboratories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: budgetCodes } = useQuery({
    queryKey: ['budgetCodes', formData.laboratory_id],
    queryFn: async () => {
      if (!formData.laboratory_id) return [];
      const { data, error } = await supabase
        .from('budget_codes')
        .select('*')
        .eq('laboratory_id', formData.laboratory_id)
        .order('code');
      if (error) throw error;
      return data;
    },
    enabled: !!formData.laboratory_id
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("No hay sesión de usuario");
        return;
      }

      const { error } = await supabase
        .from('travel_requests')
        .insert({
          user_id: session.user.id,
          start_date: formData.start_date,
          end_date: formData.end_date,
          destination: formData.destination,
          purpose: formData.purpose,
          description: formData.description,
          laboratory_id: formData.laboratory_id,
          budget_code_id: formData.budget_code_id,
          status: 'pending'
        });

      if (error) throw error;

      toast.success("Solicitud de viaje creada exitosamente");
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating travel request:', error);
      toast.error("Error al crear la solicitud de viaje");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nueva Solicitud de Viaje</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Fecha de Inicio</Label>
              <Input
                id="start_date"
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Fecha de Fin</Label>
              <Input
                id="end_date"
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destino</Label>
            <Input
              id="destination"
              required
              value={formData.destination}
              onChange={(e) => handleChange('destination', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Propósito</Label>
            <Input
              id="purpose"
              required
              value={formData.purpose}
              onChange={(e) => handleChange('purpose', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="laboratory">Laboratorio</Label>
            <Select
              value={formData.laboratory_id}
              onValueChange={(value) => handleChange('laboratory_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un laboratorio" />
              </SelectTrigger>
              <SelectContent>
                {laboratories?.map((lab) => (
                  <SelectItem key={lab.id} value={lab.id}>
                    {lab.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget_code">Código Presupuestal</Label>
            <Select
              value={formData.budget_code_id}
              onValueChange={(value) => handleChange('budget_code_id', value)}
              disabled={!formData.laboratory_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un código presupuestal" />
              </SelectTrigger>
              <SelectContent>
                {budgetCodes?.map((code) => (
                  <SelectItem key={code.id} value={code.id}>
                    {code.code} - {code.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Guardando...
                </>
              ) : (
                'Crear Solicitud'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
