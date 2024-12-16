import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LoadingSpinner } from "../ui/loading";

interface RegisterFormProps {
  onToggleRegister: () => void;
}

const RegisterForm = ({ onToggleRegister }: RegisterFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!email || !password || !firstName || !lastName) {
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      // First get a default role
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'Administrator')
        .single();

      if (rolesError) {
        console.error('Error fetching default role:', rolesError);
        toast.error("Error al crear usuario");
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            role_id: roles.id
          }
        }
      });

      if (signUpError) {
        console.error("Register error:", signUpError);
        
        if (signUpError.message.includes("user_already_exists") || 
            (typeof signUpError === 'object' && 
             signUpError.message && 
             signUpError.message.includes("User already registered"))) {
          toast.error("Este email ya está registrado. Por favor, inicia sesión.");
          onToggleRegister();
          return;
        }

        toast.error("Error al registrar usuario. Por favor, intenta de nuevo.");
        return;
      }

      // Insert into profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          is_admin: true // Set as admin for testing purposes
        })
        .eq('email', email.trim());

      if (profileError) {
        console.error('Error updating profile:', profileError);
        toast.error("Error al actualizar perfil de usuario");
        return;
      }

      toast.success("Registro exitoso. Por favor verifica tu correo electrónico.");
      onToggleRegister();
    } catch (error) {
      console.error("Unexpected error during registration:", error);
      toast.error("Error al registrar usuario");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">Nombre</Label>
        <Input
          id="firstName"
          placeholder="Ingresa tu nombre"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Apellido</Label>
        <Input
          id="lastName"
          placeholder="Ingresa tu apellido"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
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
          autoComplete="new-password"
          disabled={isLoading}
        />
      </div>
      <Button
        className="w-full"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? <LoadingSpinner /> : "Registrarse"}
      </Button>
      <Button
        variant="outline"
        type="button"
        onClick={onToggleRegister}
        disabled={isLoading}
      >
        ¿Ya tienes cuenta? Inicia sesión
      </Button>
    </form>
  );
};

export default RegisterForm;