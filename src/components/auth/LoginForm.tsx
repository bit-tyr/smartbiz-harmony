
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LoadingSpinner } from "../ui/loading";
import { createAdminProfile, handleAuthError, checkExistingAdmin } from "@/utils/auth";
import { getUserProfile } from "@/utils/auth-api";
import { validateLoginForm } from "./LoginFormValidation";
import { supabase } from "@/integrations/supabase/client";

interface LoginFormProps {
  onToggleRegister: () => void;
  onForgotPassword: () => void;
}

const LoginForm = ({ onToggleRegister, onForgotPassword }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent | null) => {
    if (e) e.preventDefault();
    
    if (!validateLoginForm(email, password)) return;
    
    setIsLoading(true);
    console.log("Attempting login with email:", email);

    try {
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;
      if (!user) throw new Error("No user data received");
      
      console.log("Auth successful, fetching profile for user:", user.id);

      // Fetch both profile and role information
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          roles!profiles_role_id_fkey (
            name
          )
        `)
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw new Error("Error fetching user profile");
      }

      if (!profile) {
        throw new Error("No profile found");
      }

      console.log("Profile fetched:", profile);

      // Check if user is in admin_users table
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      const isAdmin = profile.is_admin || !!adminUser;
      
      if (isAdmin) {
        console.log("User is admin, redirecting to admin panel");
        toast.success("Inicio de sesión exitoso como administrador");
        navigate("/admin");
      } else {
        console.log("User is not admin, redirecting to select area");
        toast.success("Inicio de sesión exitoso");
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
