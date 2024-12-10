import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = "Ha ocurrido un error al iniciar sesión";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Email o contraseña incorrectos";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Email no confirmado. Por favor, verifica tu correo electrónico";
        }
        
        toast.error(errorMessage);
        return;
      }

      toast.success("Inicio de sesión exitoso");
      navigate("/");
    } catch (error) {
      toast.error("Ha ocurrido un error al iniciar sesión");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Registro exitoso. Por favor verifica tu correo electrónico.");
    } catch (error) {
      toast.error("Error al registrar usuario");
      console.error("Register error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Por favor, ingresa tu correo electrónico");
      return;
    }
    
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) throw error;

      toast.success("Se ha enviado un correo para restablecer tu contraseña");
    } catch (error) {
      toast.error("Error al enviar correo de recuperación");
      console.error("Reset password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-[350px] space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">
            {isRegistering ? "Registro" : "Iniciar Sesión"}
          </h1>
          <p className="text-gray-500">
            {isRegistering
              ? "Crea una nueva cuenta"
              : "Ingresa tus credenciales para acceder al sistema"}
          </p>
        </div>
        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
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
            {isLoading 
              ? (isRegistering ? "Registrando..." : "Iniciando sesión...") 
              : (isRegistering ? "Registrarse" : "Iniciar Sesión")}
          </Button>
        </form>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering 
              ? "¿Ya tienes cuenta? Inicia sesión" 
              : "¿No tienes cuenta? Regístrate"}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link">¿Olvidaste tu contraseña?</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Restablecer contraseña</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Correo electrónico</Label>
                  <Input
                    id="reset-email"
                    placeholder="Ingresa tu correo electrónico"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Enviar correo de recuperación
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Login;
