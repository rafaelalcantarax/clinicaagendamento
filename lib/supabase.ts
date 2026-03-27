
import { createClient } from '@supabase/supabase-js';
import { ENV } from '../config/env';

// Initialize with explicit auth persistence to prevent session drops in different contexts
export const supabase = createClient(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage
    }
  }
);
