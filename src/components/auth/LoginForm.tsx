import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LoadingSpinner } from "../ui/loading";
import { createAdminProfile, handleAuthError, checkExistingAdmin } from "@/utils/auth";
import { loginUser, fetchUserProfile } from "@/utils/auth-api";
import { validateLoginForm } from "./LoginFormValidation";
import { supabase } from "@/integrations/supabase/client";

interface LoginFormProps {
  onToggleRegister: () => void;
  onForgotPassword: () => void;
}

const LoginForm = ({ onToggleRegister, onForgotPassword }: LoginFormProps) => {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const createAdminUser = async () => {
    setIsLoading(true);
    try {
      const hasExistingAdmin = await checkExistingAdmin();

      if (hasExistingAdmin) {
        toast.info("El usuario administrador ya existe, intentando iniciar sesión...");
        await handleLogin(null, true);
        return;
      }

      const authResponse = await loginUser("admin@example.com", "admin123");
      if (!authResponse.user) throw new Error("No user data received");

      const result = await createAdminProfile(authResponse.user.id);
      if (!result.success) throw result.error;

      toast.success('Usuario administrador creado exitosamente');
      await handleLogin(null, true);
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast.error('Error al crear usuario administrador');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent | null, isAutoLogin = false) => {
    if (e) e.preventDefault();
    
    const loginEmail = isAutoLogin ? "admin@example.com" : email;
    const loginPassword = isAutoLogin ? "admin123" : password;
    
    if (!isAutoLogin && !validateLoginForm(loginEmail, loginPassword)) return;
    
    setIsLoading(true);
    console.log("Attempting login with email:", loginEmail);

    try {
      const authData = await loginUser(loginEmail, loginPassword);
      if (!authData.user) throw new Error("No user data received");
      
      console.log("Auth successful, fetching profile for user:", authData.user.id);

      const profile = await fetchUserProfile(authData.user.id);
      
      const successMessage = profile.is_admin 
        ? "Inicio de sesión exitoso como administrador"
        : "Inicio de sesión exitoso";
      
      toast.success(successMessage);
      console.log("Login successful, redirecting user. Is admin:", profile.is_admin);
      
      if (profile.is_admin) {
        navigate("/admin");
      } else {
        navigate("/select-area");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.message.includes("No profile found")) {
        toast.error("No se encontró el perfil del usuario");
        await supabase.auth.signOut();
      } else {
        handleAuthError(error);
      }
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