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
        <main className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Add New Scheme</h1>
                    <Link href="/admin/dashboard" className="text-slate-300 hover:text-white transition-colors">Cancel</Link>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Basic Info */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Basic Details</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Scheme Title</label>
                                <input name="title" required value={formData.title} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. PM Kisan Samman Nidhi" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Ministry / Department</label>
                                <input name="ministry" required value={formData.ministry} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Ministry of Agriculture" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                <select name="category" required value={formData.category} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option>Agriculture</option>
                                    <option>Education</option>
                                    <option>Health</option>
                                    <option>Housing</option>
                                    <option>Business</option>
                                    <option>BPL/Ration</option>
                                    <option>Pension</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                <textarea name="description" required rows={3} value={formData.description} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Brief summary of the scheme..." />
                            </div>
                        </div>
                    </section>

                    {/* Eligibility & Benefits */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Criteria & Benefits</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Benefits</label>
                                <textarea name="benefits" rows={3} value={formData.benefits} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Explain the benefits..." />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Eligibility Criteria</label>
                                <textarea name="eligibility" rows={3} value={formData.eligibility} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Who can apply?" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Benefit Amount (₹)</label>
                                <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0 if not monetary" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Income Limit (₹/Year)</label>
                                <input type="number" name="incomeLimit" value={formData.incomeLimit} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Max annual income" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Min Age</label>
                                <input type="number" name="ageMin" value={formData.ageMin} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Max Age</label>
                                <input type="number" name="ageMax" value={formData.ageMax} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Eligible Castes</label>
                                <input name="caste" value={formData.caste} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="SC, ST, OBC, General" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="All">All</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Transgender">Transgender</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Documents Required (Comma Separated)</label>
                                <input name="documentsRequired" value={formData.documentsRequired} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Aadhar Card, PAN Card, Income Certificate" />
                            </div>
                        </div>
                    </section>

                    {/* Meta & Links */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Dates & Links</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Application Deadline</label>
                                <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Application URL</label>
                                <input name="applicationUrl" value={formData.applicationUrl} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tags (Comma Separated)</label>
                                <input name="tags" value={formData.tags} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="farming, subsidy, loan" />
                            </div>
                        </div>
                    </section>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                        {isLoading ? "Publishing..." : "🚀 Publish Scheme"}
                    </button>
                </form>
            </div>
        </main>
    );
}
