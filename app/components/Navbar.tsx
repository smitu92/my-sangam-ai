"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import MobileMenu from "./MobileMenu";
import ProfileSidebar from "./ProfileSidebar";

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [user, setUser] = useState<{ name: string, email?: string, role?: string, gender?: string } | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const storedUser = localStorage.getItem("userProfile");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem("userProfile");
        setUser(null);
        setIsProfileOpen(false);
        window.location.href = "/";
    };

    const isActive = (path: string) => pathname === path ? "text-blue-600 font-bold bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50 font-medium";

    return (
        <>
            <nav className="w-full bg-white/70 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 border-b border-white/20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm group-hover:scale-105 transition-transform">S</div>
                            <span className="font-bold text-xl text-gray-900 tracking-tight group-hover:text-blue-800 transition-colors">Sangam</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex space-x-2 items-center">
                            <Link href="/" className={`${isActive("/")} px-4 py-2 rounded-lg text-sm transition-all`}>Home</Link>
                            <Link href="/schemes" className={`${isActive("/schemes")} px-4 py-2 rounded-lg text-sm transition-all`}>Schemes</Link>
                            <Link href="/loans" className={`${isActive("/loans")} px-4 py-2 rounded-lg text-sm transition-all`}>Loans</Link>
                            <Link href="/categories" className={`${isActive("/categories")} px-4 py-2 rounded-lg text-sm transition-all`}>Categories</Link>
                            <Link href="/news" className={`${isActive("/news")} px-4 py-2 rounded-lg text-sm transition-all`}>News</Link>
                        </div>

                        {/* Right Side Actions */}
                        <div className="hidden md:flex items-center gap-4">
                            {user ? (
                                <button
                                    onClick={() => setIsProfileOpen(true)}
                                    className="flex items-center gap-3 hover:bg-gray-50 rounded-full py-1.5 px-2 pl-4 border border-transparent hover:border-gray-200 transition-all group"
                                >
                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 max-w-[100px] truncate">{user.name}</span>
                                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                </button>
                            ) : (
                                <Link href="/login" className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-all text-sm shadow-md hover:shadow-lg transform active:scale-95">
                                    Login
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex md:hidden items-center gap-4">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="text-gray-500 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sidebar Components */}
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                user={user}
                onProfileClick={() => setIsProfileOpen(true)}
            />

            <ProfileSidebar
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
                onLogout={handleLogout}
            />
        </>
    );
}
