import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast.error("Por favor, ingresa tu correo electrónico");
      return;
    }
    
    setIsResetting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);

      if (error) throw error;

      toast.success("Se ha enviado un correo para restablecer tu contraseña");
      setIsResetDialogOpen(false);
    } catch (error) {
      toast.error("Error al enviar correo de recuperación");
      console.error("Reset password error:", error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });

      if (error) throw error;

      toast.success("Inicio de sesión exitoso");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Error al iniciar sesión");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl flex overflow-hidden">
        {/* Lado izquierdo con ilustración */}
        <div className="hidden lg:block lg:w-1/2 bg-blue-600 relative">
          <img 
            src="/images/scientist.png" 
            alt="Scientist illustration" 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600/90 to-transparent p-12">
            <h3 className="text-xl font-medium mb-4 text-white">Sistema de Gestión</h3>
            <p className="text-sm text-white/80">
              Bienvenido al sistema de gestión del Institut Pasteur de Montevideo
            </p>
          </div>
        </div>

        {/* Lado derecho con formulario */}
        <div className="w-full lg:w-1/2 p-12">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center mb-8">
              <img 
                src="/images/institut-pasteur-logo.png" 
                alt="Logo" 
                className="h-32"
              />
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-8">Iniciar Sesión</h2>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <input 
                  type="text" 
                  id="username"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors placeholder-gray-400"
                  placeholder="Correo electrónico"
                />
              </div>
              
              <div>
                <input 
                  type="password" 
                  id="password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors placeholder-gray-400"
                  placeholder="Contraseña"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-600">
                  <input type="checkbox" className="mr-2" />
                  Recordarme
                </label>
                <a href="#" className="text-blue-600 hover:text-blue-700">¿Olvidaste tu contraseña?</a>
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Ingresar
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-gray-600">¿No tienes una cuenta?</span>
              <a href="#" className="text-blue-600 hover:text-blue-700 ml-1 font-medium">
                Regístrate aquí
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;