import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LoadingSpinner } from "../ui/loading";

interface LoginFormProps {
  onToggleRegister: () => void;
  onForgotPassword: () => void;
}

const LoginForm = ({ onToggleRegister, onForgotPassword }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email || !password) {
      toast.error("Por favor, completa todos los campos");
      return false;
    }
    
    if (!email.includes("@")) {
      toast.error("Por favor, ingresa un email válido");
      return false;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        console.error("Auth error details:", authError);
        
        if (authError.message.includes("Failed to fetch") || authError.message.includes("NetworkError")) {
          toast.error("Error de conexión. Por favor, verifica tu conexión a internet e intenta de nuevo.");
        } else if (authError.message.includes("Invalid login credentials")) {
          toast.error("Email o contraseña incorrectos");
        } else if (authError.message.includes("Email not confirmed")) {
          toast.error("Por favor, verifica tu correo electrónico");
        } else {
          toast.error("Error al iniciar sesión. Por favor, intenta de nuevo.");
        }
        return;
      }

      if (!authData?.user) {
        toast.error("No se pudo obtener la información del usuario");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin, role_id, laboratory_id')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        toast.error("Error al verificar permisos de usuario");
        return;
      }

      toast.success("Inicio de sesión exitoso");
      
      if (profile?.is_admin) {
        navigate("/admin");
      } else {
        navigate("/select-area");
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
      toast.error("Ha ocurrido un error inesperado. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          placeholder="Ingresa tu correo electrónico"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          placeholder="Ingresa tu contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          disabled={isLoading}
        />
      </div>
      <Button
        className="w-full"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? <LoadingSpinner /> : "Iniciar Sesión"}
      </Button>
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          type="button"
          onClick={onToggleRegister}
          disabled={isLoading}
        >
          ¿No tienes cuenta? Regístrate
        </Button>
        <Button 
          variant="link" 
          type="button"
          onClick={onForgotPassword}
          disabled={isLoading}
        >
          ¿Olvidaste tu contraseña?
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;