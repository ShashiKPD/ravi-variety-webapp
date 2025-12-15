import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';

// 'cache' dedupes this request for the duration of a single page render.
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();

  // 1. Get User (Security Check)
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, role: 'anon' };
  }

  // 2. Get Profile (Role Check)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    // Fallback if profile is missing (shouldn't happen)
    return { user, role: 'anon' };
  }

  return { user, role: profile.role };
});