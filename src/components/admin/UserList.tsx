import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Profile {
  id: string;
  email: string | null;
  is_admin: boolean | null;
  role_id: string;
  laboratory_id?: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
  roles?: {
    name: string;
  };
}

interface Role {
  id: string;
  name: string;
}

interface Laboratory {
  id: string;
  name: string;
}

interface UserListProps {
  searchQuery: string;
}

export const UserList = ({ searchQuery }: UserListProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch roles
      const { data: rolesData } = await supabase
        .from('roles')
        .select('*');
      
      if (rolesData) setRoles(rolesData);

      // Fetch laboratories
      const { data: labsData } = await supabase
        .from('laboratories')
        .select('*');
      
      if (labsData) setLaboratories(labsData);

      // Fetch all profiles with their related data
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select(`
          *,
          roles (
            name
          )
        `);

      if (error) throw error;
      if (profilesData) {
        setProfiles(profilesData as Profile[]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, roleId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role_id: roleId })
        .eq('id', userId);

      if (error) throw error;
      
      toast.success('Rol actualizado exitosamente');
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error al actualizar el rol');
    }
  };

  const updateUserLaboratory = async (userId: string, laboratoryId: string | null) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ laboratory_id: laboratoryId })
        .eq('id', userId);

      if (error) throw error;
      
      toast.success('Laboratorio asignado exitosamente');
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error updating laboratory:', error);
      toast.error('Error al asignar el laboratorio');
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      
      toast.success('Estado de administrador actualizado');
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast.error('Error al actualizar el estado de administrador');
    }
  };

  const filteredProfiles = profiles.filter(profile => 
    profile.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Laboratorio</TableHead>
          <TableHead>Admin</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredProfiles.map((profile) => (
          <TableRow key={profile.id}>
            <TableCell>{profile.email}</TableCell>
            <TableCell>
              <select
                className="border rounded p-1"
                value={profile.role_id}
                onChange={(e) => updateUserRole(profile.id, e.target.value)}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </TableCell>
            <TableCell>
              <select
                className="border rounded p-1"
                value={profile.laboratory_id || ''}
                onChange={(e) => updateUserLaboratory(profile.id, e.target.value || null)}
              >
                <option value="">Sin laboratorio</option>
                {laboratories.map((lab) => (
                  <option key={lab.id} value={lab.id}>
                    {lab.name}
                  </option>
                ))}
              </select>
            </TableCell>
            <TableCell>{profile.is_admin ? 'Sí' : 'No'}</TableCell>
            <TableCell>
              <Button
                variant="outline"
                onClick={() => toggleAdminStatus(profile.id, profile.is_admin)}
              >
                {profile.is_admin ? 'Quitar Admin' : 'Hacer Admin'}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};