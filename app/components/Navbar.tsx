"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import MobileMenu from "./MobileMenu";
import ProfileSidebar from "./ProfileSidebar";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const isHome = true; // Force Home style for all pages

    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
    };

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isActive = (path: string) => {
        return pathname === path ? "text-white font-bold bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5 font-medium";
    }

    return (
        <>
            <nav className={`w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-[#111111]/90 border-b border-white/10 backdrop-blur-xl shadow-lg" : "bg-transparent border-transparent"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xl shadow-sm transition-transform group-hover:scale-105 bg-white text-black">
                                <GraduationCap size={20} />
                            </div>
                            <span className="font-bold text-xl tracking-tight transition-colors text-white">
                                Sangam
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex space-x-2 items-center">
                            <Link href="/" className={`${isActive("/")} px-4 py-2 rounded-lg text-sm transition-all`}>Home</Link>
                            <Link href="/schemes" className={`${isActive("/schemes")} px-4 py-2 rounded-lg text-sm transition-all`}>Schemes</Link>
                            <Link href="/loans" className={`${isActive("/loans")} px-4 py-2 rounded-lg text-sm transition-all`}>Loans</Link>
                            <Link href="/news" className={`${isActive("/news")} px-4 py-2 rounded-lg text-sm transition-all`}>News</Link>
                            {user ? (
                                <Link href="/profile" className={`${isActive("/profile")} px-4 py-2 rounded-lg text-sm transition-all`}>Dashboard</Link>
                            ) : null}
                            {user?.role === "admin" && (
                                <Link href="/admin/dashboard" className="px-4 py-2 rounded-lg text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all border border-red-200">
                                    Admin Panel
                                </Link>
                            )}
                        </div>

                        {/* Right Side Actions */}
                        <div className="hidden md:flex items-center gap-4">
                            {user ? (
                                <button
                                    onClick={() => setIsProfileOpen(true)}
                                    className={`flex items-center gap-3 rounded-full py-1.5 px-2 pl-4 border transition-all group ${isHome ? "hover:bg-white/10 border-transparent hover:border-white/20" : "hover:bg-gray-50 border-transparent hover:border-gray-200"}`}
                                >
                                    <span className="text-sm font-semibold max-w-[100px] truncate text-gray-200 group-hover:text-white">{user.name}</span>
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold border transition-colors bg-gray-800 text-white border-gray-700 group-hover:bg-gray-700">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                </button>
                            ) : (
                                <Link href="/login" className="px-6 py-2.5 rounded-lg font-bold transition-all text-sm shadow-md hover:shadow-lg transform active:scale-95 bg-white text-black hover:bg-gray-200">
                                    Login
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex md:hidden items-center gap-4">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="p-2 rounded-lg transition-colors text-gray-300 hover:text-white hover:bg-white/10"
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
