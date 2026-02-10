"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    email: string;
    name: string;
    role: string | null;
    image?: string | null;
    mobile?: string;
    dob?: string;
    gender?: string;
    category?: string;
    occupation?: string;
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
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (user: User, redirectPath?: string) => void;
    logout: () => void;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: () => { },
    logout: () => { },
    setUser: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for existing session
        const checkUser = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    console.log("No active session found");
                }
            } catch (error) {
                console.error("Failed to check auth status", error);
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, []);

    const login = (userData: User, redirectPath: string = "/profile") => {
        setUser(userData);
        router.push(redirectPath);
    };

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            setUser(null);
            router.push("/");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
