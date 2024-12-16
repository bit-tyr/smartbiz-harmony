import { useState } from "react";
import { MoreHorizontal, Lock, Unlock } from "lucide-react";
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
  onUpdate: () => void;
}

export function UserActions({ userId, isBlocked, onUpdate }: UserActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const toggleBlockStatus = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_blocked: !isBlocked })
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error('No profile found');
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}