import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LoadingSpinner } from "../ui/loading";
import { createAdminProfile, handleAuthError, checkExistingAdmin } from "@/utils/auth";

interface LoginFormProps {
  onToggleRegister: () => void;
  onForgotPassword: () => void;
}

const LoginForm = ({ onToggleRegister, onForgotPassword }: LoginFormProps) => {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email || !password) {
      toast.error("Por favor, completa todos los campos");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, ingresa un email válido");
      return false;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    return true;
  };

  const createAdminUser = async () => {
    setIsLoading(true);
    try {
      const hasExistingAdmin = await checkExistingAdmin();

      if (hasExistingAdmin) {
        toast.info("El usuario administrador ya existe, intentando iniciar sesión...");
        await handleLogin(null, true);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: "admin@example.com",
        password: "admin123",
      });

      if (error) {
        // If user exists, try to log in
        if (error.message.includes("User already registered")) {
          toast.info("El usuario ya existe, intentando iniciar sesión...");
          await handleLogin(null, true);
          return;
        }
        throw error;
      }

      if (data?.user) {
        const result = await createAdminProfile(data.user.id);
        
        if (!result.success) {
          throw result.error;
        }

        toast.success('Usuario administrador creado exitosamente');
        await handleLogin(null, true);
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast.error('Error al crear usuario administrador');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent | null, isAutoLogin = false) => {
    if (e) e.preventDefault();
    
    if (!isAutoLogin && !validateForm()) return;
    
    setIsLoading(true);
    console.log("Attempting login with email:", isAutoLogin ? "admin@example.com" : email.trim().toLowerCase());

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: isAutoLogin ? "admin@example.com" : email.trim().toLowerCase(),
        password: isAutoLogin ? "admin123" : password,
      });

      if (authError) {
        handleAuthError(authError);
        return;
      }

      if (!authData?.user) {
        console.error("No user data received after successful auth");
        toast.error("No se pudo obtener la información del usuario");
        return;
      }

      console.log("Auth successful, fetching profile for user:", authData.user.id);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin, role_id, laboratory_id, first_name, last_name')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        toast.error("Error al verificar permisos de usuario");
        return;
      }

      if (!profile) {
        console.error("No profile found for user:", authData.user.id);
        toast.error("No se encontró el perfil del usuario");
        await supabase.auth.signOut();
        return;
      }

      const successMessage = profile.is_admin 
        ? "Inicio de sesión exitoso como administrador"
        : "Inicio de sesión exitoso";
      
      toast.success(successMessage);
      console.log("Login successful, redirecting user. Is admin:", profile?.is_admin);
      
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
      <Button
        variant="outline"
        type="button"
        onClick={createAdminUser}
        disabled={isLoading}
        className="w-full"
      >
        Crear Usuario Administrador
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