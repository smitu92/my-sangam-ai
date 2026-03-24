# Supabase Auth: A Quick Guide

## What is Supabase Auth?
Supabase Auth is a complete authentication system built into Supabase. When you use it, you don't need to manually hash passwords, create JWT tokens, or manually keep track of sessions! 

Supabase gives you a secure `auth.users` table inside your PostgreSQL database under the hood. 

## The Core Concept
Instead of dealing with a `User` table and a `UserProfile` table inside your Prisma schema, the standard practice when using Supabase is:

1. Let Supabase securely create and hold the **Email, Password, and UUID** in its internal `auth.users` table.
2. Store all **extra information** (like age, district, education, etc.) in your Prisma `UserProfile` table.
3. Link them by storing the `user.id` given to you by Supabase inside your Prisma `UserProfile.userId`.

---

## 1. How to Initialize the Client
To talk to Supabase from an API Route or server, we use the standard `@supabase/supabase-js` client. 

```typescript
import { createClient } from "@supabase/supabase-js";

// You initialize it by passing your Project URL and your public/anon key from your `.env` file
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

---

## 2. How to Sign Up (Register)
To register a new user, you call `supabase.auth.signUp()`. It requires an object with `email` and `password`.

```typescript
const { data, error } = await supabase.auth.signUp({
    email: "test@example.com",
    password: "Password123"
});

// ✅ Handling Errors:
// If the email is invalid, the password is too weak, or the user ALREADY EXISTS,
// Supabase will automatically return an error that we can catch!
if (error) {
    console.log("Uh oh! Failed to sign up:", error.message);
}

// ✅ On Success:
// If successful, Supabase returns the securely created user data.
// We just extract the 'id' and save it inside our Prisma database so we know who is who!
const userId = data.user.id; 

await prisma.userProfile.create({
    data: {
        userId: userId, // Match it to the Supabase ID!
        name: "Smit Patel",
        age: 23
    }
});
```

---

## 3. How to Sign In (Login)
In your `login/route.ts` API route (which you will likely build next), you use `signInWithPassword()` instead of comparing manual `bcrypt` hashes!

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
    email: "test@example.com",
    password: "Password123"
});

// If password or email is wrong, 'error' will be filled with a friendly message.
if (error) {
    return { error: "Invalid credentials" };
}

// On success, Supabase will give you a 'session' object containing secure JWT tokens!
const jwtToken = data.session.access_token;
```
