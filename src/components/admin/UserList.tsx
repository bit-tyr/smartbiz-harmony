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
import { UserActions } from "./UserActions";
import { UserRoleSelect } from "./UserRoleSelect";
import { UserLaboratorySelect } from "./UserLaboratorySelect";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";

interface Profile {
  id: string;
  email: string | null;
  is_admin: boolean | null;
  is_blocked: boolean | null;
  role_id: string;
  laboratory_id: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
  roles?: {
    name: string;
  };
}

interface UserListProps {
  searchQuery: string;
}

export const UserList = ({ searchQuery }: UserListProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // First get all users from auth
      const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching users:', authError);
        throw authError;
      }

      // Then get their profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          roles (
            name
          )
        `);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Create a default profile object with all required properties
      const defaultProfile: Omit<Profile, 'id' | 'email' | 'created_at'> = {
        updated_at: '',
        is_admin: false,
        is_blocked: false,
        role_id: '',
        laboratory_id: null,
        first_name: null,
        last_name: null,
        roles: undefined
      };

      // Combine the data ensuring all required Profile properties are present
      const combinedData = users.map(user => {
        const profile = profilesData?.find(p => p.id === user.id) || defaultProfile;
        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          updated_at: profile.updated_at || user.created_at,
          is_admin: profile.is_admin || false,
          is_blocked: profile.is_blocked || false,
          role_id: profile.role_id || '',
          laboratory_id: profile.laboratory_id || null,
          first_name: profile.first_name || null,
          last_name: profile.last_name || null,
          roles: profile.roles,
        } as Profile;
      });

      console.log("Combined user data:", combinedData);
      setProfiles(combinedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar los datos');
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProfiles = profiles.filter(profile => 
    profile.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Usuario</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Laboratorio</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProfiles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No se encontraron usuarios
              </TableCell>
            </TableRow>
          ) : (
            filteredProfiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{profile.email}</span>
                    {(profile.first_name || profile.last_name) && (
                      <span className="text-sm text-muted-foreground">
                        {[profile.first_name, profile.last_name].filter(Boolean).join(' ')}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <UserRoleSelect
                    userId={profile.id}
                    currentRoleId={profile.role_id}
                    onUpdate={fetchData}
                  />
                </TableCell>
                <TableCell>
                  <UserLaboratorySelect
                    userId={profile.id}
                    currentLabId={profile.laboratory_id}
                    onUpdate={fetchData}
                  />
                </TableCell>
                <TableCell>
                  <Badge variant={profile.is_admin ? "default" : "secondary"}>
                    {profile.is_admin ? 'Sí' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={profile.is_blocked ? "destructive" : "outline"}
                    className={profile.is_blocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
                  >
                    {profile.is_blocked ? 'Bloqueado' : 'Activo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <UserActions
                    userId={profile.id}
                    isBlocked={profile.is_blocked || false}
                    onUpdate={fetchData}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};