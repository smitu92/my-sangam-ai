"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formElement = e.target as HTMLFormElement;
        const email = (formElement.elements.namedItem("email") as HTMLInputElement).value;
        const password = (formElement.elements.namedItem("password") as HTMLInputElement).value;

        try {
            const result = await login(email, password);
            if (result.error) {
                throw new Error(result.error);
            }
            // Redirect is handled by middleware/auth state change
            window.location.href = "/profile";
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen pt-32 pb-20 bg-[#f3f0e9] flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in-up">

                {/* Header */}
                <div className="bg-[#111111] p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_400px_at_50%_-100px,#1a1a1a,transparent)]"></div>

                    <h1 className="text-3xl font-extrabold text-white mb-2 relative z-10">Welcome Back</h1>
                    <p className="text-gray-400 relative z-10">Login to access your personalized schemes.</p>
                </div>

                {/* Form */}
                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && <div className="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded-lg">{error}</div>}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                            <input
                                id="login-password"
                                name="password"
                                type="password"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                                placeholder="••••••••"
                                required
                            />
                            <div className="text-right mt-2">
                                <a href="#" className="text-xs font-bold text-blue-600 hover:underline">Forgot Password?</a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#111111] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {isLoading ? (
                                <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                "Login"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 relative text-center">
                        <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200"></div>
                        <span className="relative bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Or Login With</span>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-bold text-gray-700">
                            <span className="text-xl">G</span> Google
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-bold text-gray-700">
                            <span className="text-xl text-blue-600">e</span> e-Pramaan
                        </button>
                    </div>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Don't have an account? <Link href="/register" className="text-blue-600 font-bold hover:underline">Sign Up</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
