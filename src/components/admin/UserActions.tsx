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
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: !isBlocked })
        .eq('id', userId);

      if (error) throw error;
      
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