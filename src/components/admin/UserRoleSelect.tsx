import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Role {
  id: string;
  name: string;
}

interface UserRoleSelectProps {
  userId: string;
  currentRoleId: string;
  onUpdate: () => void;
}

export const UserRoleSelect = ({ userId, currentRoleId, onUpdate }: UserRoleSelectProps) => {
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      const { data, error } = await supabase.from('roles').select('*');
      if (error) {
        console.error('Error fetching roles:', error);
        toast.error('Error al cargar los roles');
        return;
      }
      if (data) setRoles(data);
    };
    fetchRoles();
  }, []);

  const updateUserRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role_id: roleId })
        .eq('id', userId)
        .select();

      if (error) {
        console.error('Error details:', error);
        if (error.code === '42501') {
          toast.error('No tienes permisos para realizar esta acción');
        } else {
          toast.error('Error al actualizar el rol');
        }
        return;
      }
      
      toast.success('Rol actualizado exitosamente');
      onUpdate();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error al actualizar el rol');
    }
  };

  return (
    <select
      className="border rounded p-1"
      value={currentRoleId}
      onChange={(e) => updateUserRole(e.target.value)}
    >
      {roles.map((role) => (
        <option key={role.id} value={role.id}>
          {role.name}
        </option>
      ))}
    </select>
  );
};