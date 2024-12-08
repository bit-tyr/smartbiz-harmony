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
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Profile {
  id: string;
  email: string;
  is_admin: boolean;
  role_id: string;
}

interface Role {
  id: string;
  name: string;
}

const Admin = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch roles
        const { data: rolesData } = await supabase
          .from('roles')
          .select('*');
        
        if (rolesData) setRoles(rolesData);

        // Fetch profiles with emails
        const { data: profilesData } = await supabase
          .from('profiles')
          .select(`
            *,
            roles (
              name
            )
          `);

        if (profilesData) {
          setProfiles(profilesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateUserRole = async (userId: string, roleId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role_id: roleId })
        .eq('id', userId);

      if (error) throw error;
      
      toast.success('Rol actualizado exitosamente');
      
      // Refresh the profiles list
      const { data } = await supabase
        .from('profiles')
        .select(`
          *,
          roles (
            name
          )
        `);
      
      if (data) setProfiles(data);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error al actualizar el rol');
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      
      toast.success('Estado de administrador actualizado');
      
      // Refresh the profiles list
      const { data } = await supabase
        .from('profiles')
        .select(`
          *,
          roles (
            name
          )
        `);
      
      if (data) setProfiles(data);
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast.error('Error al actualizar el estado de administrador');
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-600 mt-2">Gestiona los usuarios y sus permisos</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
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
    </div>
  );
};

export default Admin;