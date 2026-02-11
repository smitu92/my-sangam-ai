"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddSchemePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        ministry: "",
        description: "",
        category: "Agriculture",
        type: "Subsidy",
        state: "Central",

        benefits: "",
        eligibility: "",
        documentsRequired: "", // Comma separated
        amount: "",

        gender: "All",
        ageMin: "",
        ageMax: "",
        incomeLimit: "",
        caste: "SC, ST, OBC, General", // Default all
        residence: "Both",

        deadline: "",
        status: "active",
        tags: "",
        applicationUrl: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch("/api/schemes/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Failed to create scheme");

            alert("Scheme Created Successfully!");
            router.push("/admin/dashboard");
        } catch (error) {
            console.error(error);
            alert("Error creating scheme. Check console.");
        } finally {
            setIsLoading(false);
        }
    };

    if (user?.role !== "admin") {
        return <div className="p-10 text-center">Unauthorized</div>;
    }

    return (
        <main className="min-h-screen bg-[#f3f0e9] py-12 px-4 font-sans text-gray-900">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Link href="/admin/dashboard" className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-2">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-[900] tracking-tight">Create New Scheme</h1>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                    <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
                        {/* 1. Basic Details */}
                        <section className="p-8 lg:p-12">
                            <div className="flex items-center gap-3 mb-8">
                                <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">1</span>
                                <h2 className="text-xl font-bold">Basic Information</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Scheme Official Title</label>
                                    <input
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                                        placeholder="e.g. Pradhan Mantri Kisan Samman Nidhi"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Ministory / Department</label>
                                    <input
                                        name="ministry"
                                        required
                                        value={formData.ministry}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                                        placeholder="e.g. Ministry of Agriculture"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                    <div className="relative">
                                        <select
                                            name="category"
                                            required
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-black focus:border-black outline-none transition-all appearance-none"
                                        >
                                            <option>Agriculture</option>
                                            <option>Education</option>
                                            <option>Health</option>
                                            <option>Housing</option>
                                            <option>Business</option>
                                            <option>BPL/Ration</option>
                                            <option>Pension</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Scheme Description</label>
                                    <textarea
                                        name="description"
                                        required
                                        rows={4}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-black focus:border-black outline-none transition-all resize-none"
                                        placeholder="Briefly explain what this scheme is about..."
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 2. Criteria */}
                        <section className="p-8 lg:p-12">
                            <div className="flex items-center gap-3 mb-8">
                                <span className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">2</span>
                                <h2 className="text-xl font-bold">Eligibility & Benefits</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Eligibility Criteria</label>
                                    <textarea
                                        name="eligibility"
                                        rows={3}
                                        value={formData.eligibility}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none"
                                        placeholder="- Must be a citizen of India&#10;- Age must be above 18&#10;- Land holding less than 2 hectares"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Scheme Benefits</label>
                                    <textarea
                                        name="benefits"
                                        rows={3}
                                        value={formData.benefits}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none"
                                        placeholder="What will the beneficiary get?"
                                    />
                                </div>

                                {/* Numeric Fields */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Monetary Benefit (₹)</label>
                                    <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-purple-500 outline-none" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Max Annual Income Limit (₹)</label>
                                    <input type="number" name="incomeLimit" value={formData.incomeLimit} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-purple-500 outline-none" placeholder="No Limit" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Min Age</label>
                                        <input type="number" name="ageMin" value={formData.ageMin} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-purple-500 outline-none" placeholder="18" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Max Age</label>
                                        <input type="number" name="ageMax" value={formData.ageMax} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-purple-500 outline-none" placeholder="60" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Gender Eligibility</label>
                                    <div className="relative">
                                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-purple-500 outline-none appearance-none">
                                            <option value="All">All Genders</option>
                                            <option value="Male">Male Only</option>
                                            <option value="Female">Female Only</option>
                                            <option value="Transgender">Transgender Only</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. Meta Data */}
                        <section className="p-8 lg:p-12 bg-gray-50">
                            <div className="flex items-center gap-3 mb-8">
                                <span className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">3</span>
                                <h2 className="text-xl font-bold">Additional Details</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Application Deadline</label>
                                    <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-orange-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Official Apply Link</label>
                                    <input name="applicationUrl" value={formData.applicationUrl} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-orange-500 outline-none" placeholder="https://..." />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Search Tags (Comma Separated)</label>
                                    <input name="tags" value={formData.tags} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g. loan, subsidy, farmers, rural" />
                                </div>
                            </div>

                            <div className="mt-12 flex gap-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-black text-white font-bold text-lg py-4 rounded-xl shadow-xl hover:bg-gray-900 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "Publishing Scheme..." : "🚀 Publish Scheme Now"}
                                </button>
                                <Link href="/admin/dashboard" className="px-8 py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                                    Cancel
                                </Link>
                            </div>
                        </section>
                    </form>
                </div>
            </div>
        </main>
    );
}
