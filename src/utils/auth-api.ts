
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email: string | null;
  is_admin: boolean;
  role_id: string | null;
  laboratory_id: string | null;
  first_name: string | null;
  last_name: string | null;
  roles?: {
    name: string;
  } | null;
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        roles:roles!role_id(name)
      `)
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return profile as UserProfile;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};
