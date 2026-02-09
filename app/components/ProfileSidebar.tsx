"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProfileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    user: any; // Assuming flexible user type for now
    onLogout: () => void;
}

export default function ProfileSidebar({ isOpen, onClose, user, onLogout }: ProfileSidebarProps) {
    const router = useRouter();

    return (
        <div className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? "visible" : "invisible pointer-events-none"}`}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isOpen ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            ></div>

            {/* Sidebar Panel */}
            <div className={`absolute top-0 right-0 h-full w-full sm:max-w-sm bg-white shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}>

                {/* Header with Dark Theme */}
                <div className="px-6 py-6 border-b border-gray-100 flex justify-between items-center bg-[#0F172A] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-20"></div>
                    <h2 className="font-bold text-lg text-white relative z-10">My Account</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-300 transition-colors relative z-10">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {user ? (
                        <>
                            {/* User Card */}
                            <div className="p-6 text-center border-b border-gray-100 bg-slate-50 relative overflow-hidden">
                                <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center text-4xl shadow-lg shadow-blue-900/5 border-4 border-white mb-4 overflow-hidden relative z-10">
                                    {user.gender === "Female" ? "👩" : "👨"}
                                </div>
                                <h3 className="font-bold text-xl text-gray-900 relative z-10">{user.name || "User"}</h3>
                                <p className="text-gray-500 text-sm mt-1 relative z-10">{user.email || "No email linked"}</p>
                                <span className="inline-block mt-3 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wide relative z-10">
                                    {user.role || "Beneficiary"}
                                </span>
                            </div>

                            {/* Menu Options */}
                            <div className="p-4 space-y-2">
                                <h4 className={`px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2 transition-all duration-500 delay-100 ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>Menu</h4>

                                <Link href="/profile" onClick={onClose} className={`flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-blue-50 text-gray-700 transition-all duration-500 delay-150 group border border-transparent hover:border-blue-100 ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                                    <span className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </span>
                                    <div className="flex-1">
                                        <span className="block font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">My Profile</span>
                                        <span className="block text-xs text-gray-500 mt-0.5">Edit details & documents</span>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </Link>

                                <Link href="/about" onClick={onClose} className={`flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-indigo-50 text-gray-700 transition-all duration-500 delay-200 group border border-transparent hover:border-indigo-100 ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                                    <span className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </span>
                                    <div className="flex-1">
                                        <span className="block font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">About Sangam</span>
                                        <span className="block text-xs text-gray-500 mt-0.5">Version, Terms & Privacy</span>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl">👤</div>
                            <h3 className="font-bold text-gray-900 text-lg">Not Logged In</h3>
                            <p className="text-gray-500 text-sm">Please log in to access your profile and personalized schemes.</p>
                            <Link href="/login" onClick={onClose} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors shadow-lg hover:shadow-blue-500/30 w-full block border border-blue-500">
                                Login Now
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {user && (
                    <div className="p-6 border-t border-gray-100 bg-white">
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 transition-all font-semibold text-sm group"
                        >
                            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Log Out
                        </button>
                        <p className="text-center text-[10px] text-gray-300 mt-3 font-medium tracking-widest uppercase">Sangam v1.0</p>
                    </div>
                )}
            </div>
        </div>
    );
}
