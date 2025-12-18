"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { updatePatientProfile } from "@/app/actions/patient"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
    const { user, loginDirect } = useAuth()
    const router = useRouter()

    const [formData, setFormData] = useState({
        name: "",
        age: "",
        sex: "",
    })
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                age: user.age?.toString() || "",
                sex: user.sex || "",
            })
        }
    }, [user])

    if (!user) return <div className="p-8">Please log in.</div>

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setStatus(null)

        const result = await updatePatientProfile(user.id, {
            name: formData.name,
            age: parseInt(formData.age),
            sex: formData.sex,
        })

        if (result.success && result.user) {
            setStatus({ type: 'success', message: "Profile updated successfully!" })
            // Update the local auth context so the sidebar name updates immediately
            loginDirect({
                ...user,
                name: result.user.name,
                age: result.user.age ?? undefined,
                sex: result.user.sex ?? undefined,
            })
        } else {
            setStatus({ type: 'error', message: result.error || "Failed to update profile" })
        }
        setLoading(false)
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">My Profile</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 bg-blue-600">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold backdrop-blur-sm">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{user.name}</h2>
                            <p className="text-blue-100 text-sm">Account ID: {(user as any).displayId || "Guest User"}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {status && (
                        <div className={`p-4 rounded-xl text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                            {status.message}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2 italic uppercase tracking-wider">Full Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 italic uppercase tracking-wider">Age</label>
                            <input
                                type="number"
                                required
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 italic uppercase tracking-wider">Sex</label>
                            <select
                                value={formData.sex}
                                onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                            >
                                <option value="">Select Sex</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? "Updating..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="mt-8 p-6 bg-gray-100 rounded-xl border border-dashed border-gray-300">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Connected Information</h3>
                <p className="text-gray-600 text-sm">
                    Registered Phone: <span className="font-mono font-bold text-gray-800">{user.phone || "Not linked"}</span>
                </p>
                <p className="text-gray-400 text-[11px] mt-2 italic">
                    Note: Phone numbers are unique and cannot be changed without contacting clinic support.
                </p>
            </div>
        </div>
    )
}
