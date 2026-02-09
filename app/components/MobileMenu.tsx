"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    user: { name: string; email?: string } | null;
    onProfileClick: () => void;
}

export default function MobileMenu({ isOpen, onClose, user, onProfileClick }: MobileMenuProps) {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Home", icon: "🏠" },
        { href: "/schemes", label: "Schemes", icon: "📜" },
        { href: "/loans", label: "Loans", icon: "💸" },
        { href: "/categories", label: "Categories", icon: "🏷️" },
        { href: "/news", label: "News", icon: "newspaper" },
    ];

    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

            <div className={`absolute top-0 left-0 h-full w-4/5 max-w-xs bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                        <span className="font-bold text-lg text-gray-800">Sangam</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Links */}
                <div className="p-4 flex-1 space-y-1 overflow-y-auto">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname === link.href ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
                        >
                            <span className="text-gray-400">{link.icon === 'newspaper' ? '📰' : link.icon}</span>
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    {user ? (
                        <button onClick={() => { onClose(); onProfileClick(); }} className="flex items-center gap-3 px-2 w-full text-left hover:bg-gray-100 p-2 rounded-lg transition-colors">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                                <p className="text-xs text-blue-600">View Profile</p>
                            </div>
                        </button>
                    ) : (
                        <Link href="/login" onClick={onClose} className="flex items-center justify-center w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
