import { createClient } from '@/utils/supabase/server'

export async function getUserProfile() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch the profile from the 'profiles' table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role') // We only need the role
    .eq('id', user.id) // Match it to the logged-in user's ID
    .single() // We expect only one row

  if (error || !profile) {
    console.error('Error fetching user profile:', error?.message)
    return null
  }

  return profile
}