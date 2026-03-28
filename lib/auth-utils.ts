import { cookies } from "next/headers";
import { adminSupabase as supabase } from "./supabase/adminSupabase";

/**
 * Standard utility to verify Supabase session from cookies in Next.js Server Components/API Routes.
 * This extracts the 'sb-access-token' and validates it against Supabase.
 * 
 * Returns the validated User object or null.
 */
export async function getServerUser() {
  const cookieStore = cookies();
  const accessToken = (await cookieStore).get("sb-access-token")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return null;
    }
    return user;
  } catch (err) {
    console.error("Error in getServerUser:", err);
    return null;
  }
}
