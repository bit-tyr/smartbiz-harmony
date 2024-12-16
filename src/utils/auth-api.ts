import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserProfile {
  is_admin: boolean;
  role_id: string;
  laboratory_id: string | null;
  first_name: string | null;
  last_name: string | null;
}

export const fetchUserProfile = async (userId: string) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin, role_id, laboratory_id, first_name, last_name')
    .eq('id', userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }

  if (!profile) {
    throw new Error("No profile found");
  }

  return profile as UserProfile;
};

export const loginUser = async (email: string, password: string) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) throw authError;
    if (!authData?.user) throw new Error("No user data received");

    return authData;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};