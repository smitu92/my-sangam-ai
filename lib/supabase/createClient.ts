// ── Create Supabase Client ────────────────────────────

import { createClient } from "@supabase/supabase-js";

// We use the basic supabase-js client to sign up the user.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);


//createClient is general way to create supabase client
//or it is low level , where createBrowserclient and serverclient is specific to browser and server and high level
