import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTheme } from "next-themes";

const Login = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        toast.success("Inicio de sesión exitoso");
        navigate("/select-area");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">Conecta2</h2>
          <p className="mt-2 text-muted-foreground">Inicie sesión para continuar</p>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary))',
                }
              }
            },
            className: {
              container: 'flex flex-col gap-4',
              button: 'bg-primary text-primary-foreground hover:bg-primary/90',
              input: 'bg-background',
            }
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Correo electrónico',
                password_label: 'Contraseña',
                button_label: 'Iniciar sesión',
                loading_button_label: 'Iniciando sesión...',
                social_provider_text: 'Iniciar sesión con {{provider}}',
                link_text: '¿Ya tienes una cuenta? Inicia sesión',
              },
              sign_up: {
                email_label: 'Correo electrónico',
                password_label: 'Contraseña',
                button_label: 'Registrarse',
                loading_button_label: 'Registrando...',
                social_provider_text: 'Registrarse con {{provider}}',
                link_text: '¿No tienes una cuenta? Regístrate',
              },
              forgotten_password: {
                email_label: 'Correo electrónico',
                button_label: 'Enviar instrucciones',
                loading_button_label: 'Enviando instrucciones...',
                link_text: '¿Olvidaste tu contraseña?',
              },
            },
          }}
          providers={[]}
          redirectTo={`${window.location.origin}/select-area`}
        />
      </div>
    </div>
  );
};

export default Login;