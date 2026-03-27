import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
console.log(__filename);
const __dirname = dirname(__filename);

// Explicitly point to the .env file in the root folder, no matter where the script is run from
dotenv.config({ path: resolve(__dirname, "../../.env") });

type SupabaseAdmin = ReturnType<typeof createClient>;

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY!;
console.log(supabaseUrl, serviceRoleKey)
if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
}

export const adminSupabase: SupabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    }
})

/*  
Yes! You'll often see `dotenv.config()` used in other files or projects. Both methods do the exact same thing (loading your [.env](cci:7://file:///Users/smitpatel/Documents/GitHub/Smit_Patel/sangam/.env:0:0-0:0) variables), they are just two different ways of writing it:

### Method 1: The Shortcut (What you have)
```typescript
import "dotenv/config";
```
This is a convenient shortcut. Because you are importing the `/config` file directly from the `dotenv` package, the package was designed to automatically run `dotenv.config()` behind the scenes in the background simply by you importing it.

### Method 2: The Manual Way (What you've seen elsewhere)
```typescript
import * as dotenv from 'dotenv';

dotenv.config();
```
In this method, you are importing the whole package into a variable called `dotenv`, and then explicitly calling the `.config()` function yourself. 

### Why would you choose one over the other?
You typically use **Method 1 (the shortcut)** when you just want to load the default [.env](cci:7://file:///Users/smitpatel/Documents/GitHub/Smit_Patel/sangam/.env:0:0-0:0) file from the root folder. It's cleaner and takes up less space.

You typically use **Method 2 (the manual way)** when you need to pass specific options to `dotenv`. For example, if you explicitly wanted to tell it to look in a different folder instead of the root directory:
```typescript
import * as dotenv from 'dotenv';

// Telling it exactly where to look for the .env file!
dotenv.config({ path: '../.env' }); 
```

Since your [.env](cci:7://file:///Users/smitpatel/Documents/GitHub/Smit_Patel/sangam/.env:0:0-0:0) file is in the default location (the root folder), the shortcut you are currently using is perfectly fine! Just remember to execute the script from the root folder (`cd ..` then `npx tsx scripts/seed-users.ts`) so the script knows where to look.

*/