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
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          roles (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log("Fetched profiles:", profilesData);
      setProfiles(profilesData || []);
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
    profile.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Laboratorio</TableHead>
          <TableHead>Admin</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredProfiles.map((profile) => (
          <TableRow key={profile.id}>
            <TableCell>{profile.email}</TableCell>
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
            <TableCell>{profile.is_admin ? 'Sí' : 'No'}</TableCell>
            <TableCell>
              {profile.is_blocked ? 'Bloqueado' : 'Activo'}
            </TableCell>
            <TableCell>
              <div className="space-x-2">
                <UserActions
                  userId={profile.id}
                  isBlocked={profile.is_blocked || false}
                  onUpdate={fetchData}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};