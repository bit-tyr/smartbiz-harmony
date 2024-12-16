import { toast } from "sonner";

export const validateLoginForm = (email: string, password: string): boolean => {
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