"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminRegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const form = e.target as HTMLFormElement;
        const name = (form.elements[0] as HTMLInputElement).value;
        const email = (form.elements[1] as HTMLInputElement).value;
        const password = (form.elements[2] as HTMLInputElement).value;
        const secretKey = (form.elements[3] as HTMLInputElement).value;

        try {
            // Register Admin
            const res = await fetch("/api/admin/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, secretKey }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Registration failed");
            }

            // Auto-login
            const loginRes = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!loginRes.ok) {
                throw new Error("Registration successful, but auto-login failed. Please login manually.");
            }

            const loginData = await loginRes.json();

            // Verify role just in case
            if (loginData.user.role !== "admin") {
                throw new Error("Critical: Account created but Admin privileges missing.");
            }

            login(loginData.user, "/admin/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4 font-sans text-slate-200">
            <div className="max-w-md w-full bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden relative">
                <div className="p-8 relative z-10">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg shadow-purple-500/20 mb-4">
                            👑
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Create Admin</h1>
                        <p className="text-slate-400 text-sm">Requires System Clearance Level 5.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center text-sm font-bold">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Full Name</label>
                            <input
                                type="text"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all"
                                placeholder="Admin Name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email</label>
                            <input
                                type="email"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all"
                                placeholder="newadmin@sangam.gov.in"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Password</label>
                            <input
                                type="password"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all"
                                placeholder="Strong Password"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Secret Key</label>
                            <input
                                type="password"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all ring-1 ring-purple-500/30"
                                placeholder="Enter system secret"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50 mt-6"
                        >
                            {isLoading ? "Creating Access..." : "Initialize Admin Account"}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
