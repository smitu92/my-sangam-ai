"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full bg-white pt-16 pb-8 border-t border-gray-200 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6 group cursor-pointer">
                            <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 via-white to-green-500 rounded-full flex items-center justify-center border border-gray-200 group-hover:rotate-12 transition-transform duration-500">
                                <span className="text-sm font-bold text-blue-800">S</span>
                            </div>
                            <span className="font-bold text-xl text-blue-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-700 group-hover:to-indigo-800 transition-colors">Sangam</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            Democratizing access to government welfare with AI-powered discovery.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Quick Links</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li className="hover:text-blue-600 hover:translate-x-1 transition-all cursor-pointer"><Link href="/about">About Us</Link></li>
                            <li className="hover:text-blue-600 hover:translate-x-1 transition-all cursor-pointer"><Link href="/contact">Contact</Link></li>
                            <li className="hover:text-blue-600 hover:translate-x-1 transition-all cursor-pointer"><Link href="/privacy">Privacy Policy</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Resources</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li className="hover:text-blue-600 hover:translate-x-1 transition-all cursor-pointer">India.gov.in</li>
                            <li className="hover:text-blue-600 hover:translate-x-1 transition-all cursor-pointer">Digital India</li>
                            <li className="hover:text-blue-600 hover:translate-x-1 transition-all cursor-pointer">PMO India</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Stay Updated</h4>
                        <div className="flex shadow-sm hover:shadow-md transition-shadow rounded-lg overflow-hidden border border-gray-200 group focus-within:ring-2 focus-within:ring-blue-100">
                            <input type="email" placeholder="Email" className="px-4 py-2 bg-gray-50 w-full text-sm focus:outline-none group-hover:bg-white transition-colors" />
                            <button className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors font-medium">
                                Go
                            </button>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 gap-4">
                    <p>&copy; 2024 Sangam AI.</p>
                    <p className="flex items-center gap-1">Made with <span className="text-red-500 animate-pulse">❤️</span> for India</p>
                </div>
            </div>
        </footer>
    );
}
