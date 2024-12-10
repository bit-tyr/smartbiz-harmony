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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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

const Admin = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

      // Fetch profiles with emails and related data
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

  const createUser = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
      });

      if (error) throw error;

      toast.success('Usuario creado exitosamente');
      setIsDialogOpen(false);
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error al crear usuario');
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
      
      // Refresh the profiles list
      const { data } = await supabase
        .from('profiles')
        .select(`
          *,
          roles (
            name
          )
        `);
      
      if (data) setProfiles(data as Profile[]);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error al actualizar el rol');
    }
  };

  const updateUserLaboratory = async (userId: string, laboratoryId: string | null) => {
    try {
      // Find the current profile to get its role_id
      const currentProfile = profiles.find(p => p.id === userId);
      if (!currentProfile) throw new Error('Profile not found');

      const { error } = await supabase
        .from('profiles')
        .update({ 
          laboratory_id: laboratoryId,
          role_id: currentProfile.role_id // Include the current role_id
        })
        .eq('id', userId);

      if (error) throw error;
      
      toast.success('Laboratorio asignado exitosamente');
      
      // Refresh the profiles list
      const { data } = await supabase
        .from('profiles')
        .select(`
          *,
          roles (
            name
          )
        `);
      
      if (data) setProfiles(data as Profile[]);
    } catch (error) {
      console.error('Error updating laboratory:', error);
      toast.error('Error al asignar el laboratorio');
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean | null) => {
    try {
      // Find the current profile to get its role_id
      const currentProfile = profiles.find(p => p.id === userId);
      if (!currentProfile) throw new Error('Profile not found');

      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_admin: !currentStatus,
          role_id: currentProfile.role_id // Include the current role_id
        })
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
      
      if (data) setProfiles(data as Profile[]);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-600 mt-2">Gestiona los usuarios y sus permisos</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Buscar por email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Crear Usuario</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                />
              </div>
              <Button onClick={createUser} className="w-full">
                Crear Usuario
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
    </div>
  );
};

export default Admin;
