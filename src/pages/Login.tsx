import { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
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

        {isRegistering ? (
          <RegisterForm onToggleRegister={() => setIsRegistering(false)} />
        ) : (
          <LoginForm
            onToggleRegister={() => setIsRegistering(true)}
            onForgotPassword={() => setIsResetDialogOpen(true)}
          />
        )}

        <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Restablecer contraseña</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="reset-email" className="text-sm font-medium">
                  Correo electrónico
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full rounded-md border px-3 py-2"
                  placeholder="Ingresa tu correo electrónico"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-primary px-4 py-2 text-white"
                disabled={isResetting}
              >
                {isResetting ? "Enviando..." : "Enviar correo de recuperación"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Login;