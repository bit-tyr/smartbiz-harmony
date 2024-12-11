import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Laboratory {
  id: string;
  name: string;
}

interface UserLaboratorySelectProps {
  userId: string;
  currentLabId: string | null;
  onUpdate: () => void;
}

export const UserLaboratorySelect = ({ userId, currentLabId, onUpdate }: UserLaboratorySelectProps) => {
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);

  useEffect(() => {
    const fetchLaboratories = async () => {
      const { data } = await supabase.from('laboratories').select('*');
      if (data) setLaboratories(data);
    };
    fetchLaboratories();
  }, []);

  const updateUserLaboratory = async (labId: string | null) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ laboratory_id: labId })
        .eq('id', userId);

      if (error) throw error;
      
      toast.success('Laboratorio actualizado exitosamente');
      onUpdate();
    } catch (error) {
      console.error('Error updating laboratory:', error);
      toast.error('Error al actualizar el laboratorio');
    }
  };

  return (
    <select
      className="border rounded p-1"
      value={currentLabId || ''}
      onChange={(e) => updateUserLaboratory(e.target.value || null)}
    >
      <option value="">Sin laboratorio</option>
      {laboratories.map((lab) => (
        <option key={lab.id} value={lab.id}>
          {lab.name}
        </option>
      ))}
    </select>
  );
};