import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserActionsProps {
  userId: string;
  isBlocked: boolean;
  onUpdate: () => void;
}

export const UserActions = ({ userId, isBlocked, onUpdate }: UserActionsProps) => {
  const toggleBlockStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_blocked: !isBlocked })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error details:', error);
        if (error.code === '42501') {
          toast.error('No tienes permisos para realizar esta acción');
        } else {
          toast.error('Error al actualizar el estado del usuario');
        }
        return;
      }
      
      toast.success(`Usuario ${isBlocked ? 'desbloqueado' : 'bloqueado'} exitosamente`);
      onUpdate();
    } catch (error) {
      console.error('Error toggling block status:', error);
      toast.error('Error al actualizar el estado del usuario');
    }
  };

  return (
    <Button
      variant="outline"
      onClick={toggleBlockStatus}
      className={isBlocked ? "bg-red-100" : ""}
    >
      {isBlocked ? 'Desbloquear' : 'Bloquear'}
    </Button>
  );
};