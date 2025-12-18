"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { getDoctors } from "@/app/actions/patient"

export default function DoctorLoginPage() {
    const { login } = useAuth()
    const router = useRouter()
    const [doctors, setDoctors] = useState<any[]>([])

    useEffect(() => {
        getDoctors().then(setDoctors)
    }, [])

    const handleLogin = (id: string) => {
        login(id)
        router.push("/doctor/dashboard")
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-blue-100">
                <div className="text-center mb-8">
                    <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                        👨‍⚕️
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Doctor Login</h1>
                    <p className="text-gray-500 text-sm mt-2">Select your profile to continue</p>
                </div>

                <div className="space-y-3">
                    {doctors.map(doc => (
                        <button
                            key={doc.id}
                            onClick={() => handleLogin(doc.id)}
                            className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center gap-4 group"
                        >
                            <div className="h-10 w-10 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center font-bold group-hover:bg-blue-200 group-hover:text-blue-700">
                                {doc.name.charAt(4)}
                            </div>
                            <div>
                                <div className="font-bold text-gray-800">{doc.name}</div>
                                <div className="text-xs text-blue-600 font-medium">
                                    {doc.specialization || "General Physician"}
                                </div>
                            </div>
                        </button>
                    ))}
                    {doctors.length === 0 && (
                        <div className="text-center text-gray-400 py-4">Loading profiles...</div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <button
                        onClick={() => router.push("/")}
                        className="text-gray-400 hover:text-gray-600 text-sm"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    )
}
