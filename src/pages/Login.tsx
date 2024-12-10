import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = "Ha ocurrido un error al iniciar sesión";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Credenciales inválidas. Por favor, verifica tu email y contraseña";
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-[350px] space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
          <p className="text-gray-500">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>
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
            />
          </div>
          <Button
            className="w-full"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;