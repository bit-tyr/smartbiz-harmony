import { useState } from "react";
import { MoreHorizontal, Lock, Unlock, Shield, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserActionsProps {
  userId: string;
  isBlocked: boolean;
  isAdmin: boolean;
  onUpdate: () => void;
}

export function UserActions({ userId, isBlocked, isAdmin, onUpdate }: UserActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const toggleBlockStatus = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_blocked: !isBlocked })
        .eq('id', userId)
        .select();

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      toast.success(`Usuario ${isBlocked ? 'desbloqueado' : 'bloqueado'} exitosamente`);
      onUpdate();
    } catch (error: any) {
      console.error('Error toggling block status:', error);
      toast.error(`Error al ${isBlocked ? 'desbloquear' : 'bloquear'} usuario: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdminStatus = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          is_admin: !isAdmin,
          // If removing admin, also set role to a non-admin role
          ...(isAdmin && { role_id: await getDefaultRoleId() })
        })
        .eq('id', userId)
        .select();

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      toast.success(`Permisos de administrador ${isAdmin ? 'removidos' : 'otorgados'} exitosamente`);
      onUpdate();
    } catch (error: any) {
      console.error('Error toggling admin status:', error);
      toast.error(`Error al modificar permisos de administrador: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultRoleId = async () => {
    const { data } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'User')
      .single();
    
    return data?.id;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={toggleBlockStatus}
          disabled={isLoading}
          className="cursor-pointer"
        >
          {isBlocked ? (
            <>
              <Unlock className="mr-2 h-4 w-4" />
              <span>Desbloquear</span>
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              <span>Bloquear</span>
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={toggleAdminStatus}
          disabled={isLoading}
          className="cursor-pointer"
        >
          {isAdmin ? (
            <>
              <ShieldOff className="mr-2 h-4 w-4" />
              <span>Quitar Admin</span>
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              <span>Hacer Admin</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}