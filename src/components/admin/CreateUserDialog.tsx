import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface CreateUserDialogProps {
  onClose: () => void;
}

export const CreateUserDialog = ({ onClose }: CreateUserDialogProps) => {
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast.error("Por favor complete todos los campos");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
      });

      if (error) {
        if (error.message.includes("already registered") || error.message.includes("already exists")) {
          toast.error("Este correo electrónico ya está registrado");
        } else {
          console.error('Error creating user:', error);
          toast.error('Error al crear usuario');
        }
        return;
      }

      if (data?.user) {
        toast.success('Usuario creado exitosamente');
        onClose();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error al crear usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={newUserPassword}
            onChange={(e) => setNewUserPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button 
          onClick={createUser} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Creando..." : "Crear Usuario"}
        </Button>
      </div>
    </DialogContent>
  );
};