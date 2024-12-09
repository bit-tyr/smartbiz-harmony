import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ylgadwbhaiivgurrrrnj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZ2Fkd2JoYWlpdmd1cnJycm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0OTI5ODksImV4cCI6MjA0OTA2ODk4OX0.p1C4wpEyraqGpK7y3ZZ24F8gczhIRci72mMiXnHzWow";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);