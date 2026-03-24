"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/createClient";

// ── Types ─────────────────────────────────────────────────────
interface UserProfile {
    id: string;
    userId: string;        // Supabase auth user id
    email: string;         // from Supabase auth
    name: string;
    role?: string | null;  // 'user' | 'admin'
    image?: string | null;
    age?: number;
    gender?: string;
    state?: string;
    district?: string;
    caste?: string;
    annualIncome?: number;
    disability?: boolean;
    rationCard?: string;
    religion?: string;
    occupation?: string;
    educationLevel?: string;
    institutionType?: string;
    courseName?: string;
    // Legacy fields from old Drizzle users table (used by profile pages)
    mobile?: string;
    dob?: string;
    category?: string;
    income?: string;
    location?: string;
    fatherName?: string;
    fatherProfession?: string;
    motherName?: string;
    motherProfession?: string;
    aadhar?: string;
    pan?: string;
    documents?: any[];
    appliedSchemes?: any[];
    savedSchemes?: any[];
    [key: string]: any;    // Allow dynamic fields for profile setup
}

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ error?: string }>;
    logout: () => Promise<void>;
    setUser: (user: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => ({}),
    logout: async () => { },
    setUser: () => { },
});

// ── Provider ──────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Fetch UserProfile from Prisma via API
    const fetchProfile = async (authUserId: string, email: string) => {
        try {
            const res = await fetch(`/api/user/profile?userId=${authUserId}`);
            if (res.ok) {
                const data = await res.json();
                setUser({ ...data.profile, email });
            } else {
                // User has Supabase auth but no profile yet (new registration edge case)
                setUser({ id: "", userId: authUserId, email, name: email.split("@")[0] });
            }
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
        }
    };

    useEffect(() => {
        // 1. Check for existing Supabase session on mount
        const checkSession = async () => {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (authUser) {
                    await fetchProfile(authUser.id, authUser.email || "");
                }
            } catch (error) {
                console.error("Auth check failed:", error);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // 2. Listen for auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === "SIGNED_IN" && session?.user) {
                    await fetchProfile(session.user.id, session.user.email || "");
                } else if (event === "SIGNED_OUT") {
                    setUser(null);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // ── Login ─────────────────────────────────────────────────
    const login = async (email: string, password: string): Promise<{ error?: string }> => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { error: error.message };
        }

        if (data.user) {
            await fetchProfile(data.user.id, data.user.email || "");
        }

        return {};
    };

    // ── Logout ────────────────────────────────────────────────
    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
