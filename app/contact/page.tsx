"use client";

import Image from "next/image";

export default function ContactPage() {
    return (
        <main className="w-full pt-32 pb-20 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 animate-fade-in-up">
                    <span className="bg-orange-50 text-orange-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide inline-block mb-4 border border-orange-100">
                        Support
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                        Get in <span className="text-orange-600">Touch</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Have questions about a scheme? Need help with your application? Our team is here to assist you.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Contact Info */}
                    <div className="bg-blue-600 rounded-3xl p-10 text-white shadow-xl h-full animate-fade-in-up animate-delay-200">
                        <h2 className="text-2xl font-bold mb-8">Contact Information</h2>

                        <div className="space-y-8">
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-xl flex-shrink-0">📍</div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Our Office</h3>
                                    <p className="text-blue-100">Block C, Technology Park,<br />New Delhi, India - 110020</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-xl flex-shrink-0">📞</div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Phone</h3>
                                    <p className="text-blue-100">+91 1800-123-4567<br />(Mon-Fri, 9am - 6pm)</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-xl flex-shrink-0">📧</div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Email</h3>
                                    <p className="text-blue-100">help@sangam.ai<br />support@sangam.gov.in</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-blue-500 flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center cursor-pointer hover:bg-white hover:text-blue-600 transition-colors">𝕏</div>
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center cursor-pointer hover:bg-white hover:text-blue-600 transition-colors">in</div>
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center cursor-pointer hover:bg-white hover:text-blue-600 transition-colors">f</div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100 animate-fade-in-up animate-delay-300">
                        <form className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">First Name</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Last Name</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" placeholder="Doe" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Email Address</label>
                                <input type="email" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" placeholder="john@example.com" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Message</label>
                                <textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none" placeholder="How can we help you?"></textarea>
                            </div>

                            <button type="button" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
