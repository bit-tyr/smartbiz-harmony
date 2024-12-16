import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const createAdminProfile = async (userId: string) => {
  try {
    // Get the Administrator role
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'Administrator')
      .single();

    if (roleError) throw roleError;

    // Update profile with admin rights and role
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        is_admin: true,
        role_id: roleData.id,
        first_name: 'Admin',
        last_name: 'User'
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    return { success: true };
  } catch (error) {
    console.error('Error creating admin profile:', error);
    return { success: false, error };
  }
};

export const handleAuthError = (error: any) => {
  console.error("Auth error details:", error);
  
  if (error.message.includes("Invalid login credentials")) {
    toast.error("Email o contraseña incorrectos");
  } else if (error.message.includes("Email not confirmed")) {
    toast.error("Por favor, verifica tu correo electrónico");
  } else {
    toast.error("Error al iniciar sesión. Por favor, intenta de nuevo.");
  }
};

export const checkExistingAdmin = async () => {
  const { data: existingUsers, error: fetchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('is_admin', true)
    .limit(1);

  if (fetchError) throw fetchError;

  return existingUsers && existingUsers.length > 0;
};