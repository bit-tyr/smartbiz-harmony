import { supabase } from "@/integrations/supabase/client";

export const getSupabaseAuth = async (action: string) => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    const user = data.user;

    console.log("Usuario autenticado:", user);

    return user; // Devuelve la información del usuario autenticado
  } catch (error) {
    console.error('Error fetching user from Supabase:', error);
    throw new Error('Error al obtener la información del usuario');
  }
}; 