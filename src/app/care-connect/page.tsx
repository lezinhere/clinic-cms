"use client"

import React from "react"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"

export default function CareConnectLanding() {
    const { user, login } = useAuth()
    const router = useRouter()

    // Auth Guard: Only Providers (Doctor, Lab, Pharmacy) can access
    React.useEffect(() => {
        if (!user) {
            router.push("/care-connect/login")
        } else if (user.role === "PATIENT") {
            router.push("/")
        } else {
            // Logged in provider? Redirect to their specific dashboard immediately
            if (user.role === "DOCTOR") router.push("/doctor/dashboard")
            else if (user.role === "PHARMACY") router.push("/pharmacy/queue")
            else if (user.role === "LAB") router.push("/lab/requests")
        }
    }, [user, router])

    const handlePortalLogin = (role: string) => {
        // Now this just routes based on current logged in user role
        // or provides quick navigation for staff
        if (role === "DOCTOR") router.push("/doctor/dashboard")
        if (role === "PHARMACY") router.push("/pharmacy/queue")
        if (role === "LAB") router.push("/lab/requests")
    }

    if (!user || user.role === "PATIENT") {
        return null // Will redirect
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
            <div className="max-w-6xl w-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-16">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold text-xl">CC</div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                            Care<span className="text-indigo-600">Connect</span> <span className="text-slate-400 font-light">Pro</span>
                        </h1>
                    </div>
                    <button onClick={() => router.push("/")} className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                        Exit to Patient Portal
                    </button>
                </div>

                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">Professional Access</h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Secure workspace for Doctors, Pathologists, and Pharmacists.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                    {/* Doctor Portal */}
                    <div
                        onClick={() => handlePortalLogin("DOCTOR")}
                        className="group cursor-pointer bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all border-t-4 border-blue-500 hover:-translate-y-1"
                    >
                        <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                            👨‍⚕️
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Doctor Station</h3>
                        <p className="text-slate-500 mb-6">OPD, Rounds, Consultations & Prescriptions</p>
                        <div className="w-full py-3 bg-slate-50 text-blue-700 font-semibold rounded-xl text-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            Enter Station
                        </div>
                    </div>

                    {/* Pharmacy Portal */}
                    <div
                        onClick={() => handlePortalLogin("PHARMACY")}
                        className="group cursor-pointer bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all border-t-4 border-emerald-500 hover:-translate-y-1"
                    >
                        <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                            💊
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Pharmacy</h3>
                        <p className="text-slate-500 mb-6">Dispensing Queue & Inventory Management</p>
                        <div className="w-full py-3 bg-slate-50 text-emerald-700 font-semibold rounded-xl text-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            Open Counter
                        </div>
                    </div>

                    {/* Lab Portal */}
                    <div
                        onClick={() => handlePortalLogin("LAB")}
                        className="group cursor-pointer bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all border-t-4 border-purple-500 hover:-translate-y-1"
                    >
                        <div className="h-16 w-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                            🧪
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Laboratory</h3>
                        <p className="text-slate-500 mb-6">Sample Collection & Test Result Uploads</p>
                        <div className="w-full py-3 bg-slate-50 text-purple-700 font-semibold rounded-xl text-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            Access Lab
                        </div>
                    </div>
                </div>

                <div className="mt-20 text-center border-t border-slate-200 pt-8 flex justify-center gap-8 text-slate-400 text-sm">
                    <span>SysAdmin Support</span>
                    <span>•</span>
                    <span>HIPAA Guidelines</span>
                    <span>•</span>
                    <span>v2.1.0 (Enterprise)</span>
                </div>
            </div>
        </div>
    )
}
