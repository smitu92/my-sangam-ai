"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate login delay
        setTimeout(() => {
            setIsLoading(false);
            window.location.href = "/profile"; // Mock redirect
        }, 1500);
    };

    return (
        <main className="min-h-screen pt-32 pb-20 bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in-up">

                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black opacity-10 rounded-full -ml-10 -mb-10"></div>

                    <h1 className="text-3xl font-extrabold text-white mb-2 relative z-10">Welcome Back</h1>
                    <p className="text-orange-100 relative z-10">Login to access your personalized schemes.</p>
                </div>

                {/* Form */}
                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all font-medium"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all font-medium"
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
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
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
                        Don't have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Sign Up</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
