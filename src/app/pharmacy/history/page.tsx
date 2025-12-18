"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { getPharmacyHistory } from "@/app/actions/staff"
import Link from "next/link"

export default function PharmacyHistoryPage() {
    const { user } = useAuth()
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        if (user && user.role === "PHARMACY") {
            getPharmacyHistory(searchQuery).then(data => {
                setHistory(data)
                setLoading(false)
            })
        }
    }, [user, searchQuery])

    if (!user) return <div className="p-8">Please log in as Pharmacy Staff.</div>

    return (
        <div className="max-w-6xl mx-auto p-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dispensed History</h1>
                    <Link href="/pharmacy/queue" className="text-teal-600 font-medium hover:underline text-sm">
                        ← Back to Active Queue
                    </Link>
                </div>
                <div className="w-full md:w-72">
                    <input
                        type="text"
                        placeholder="Search Name or PID..."
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            {loading ? (
                <div>Loading history...</div>
            ) : history.length === 0 ? (
                <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                    No dispensed history found.
                </div>
            ) : (
                <div className="grid gap-6">
                    {/* Desktop Header */}
                    <div className="hidden lg:grid grid-cols-4 bg-gray-50 p-4 rounded-xl text-xs uppercase font-bold text-gray-500 tracking-wider">
                        <div>Date</div>
                        <div>Patient</div>
                        <div>Doctor</div>
                        <div>Medicines</div>
                    </div>

                    {history.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            {/* Mobile Layout */}
                            <div className="lg:hidden space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                        <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                            {item.consultation.appointment.patient.name}
                                            {item.consultation.appointment.patient.displayId && (
                                                <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-mono">
                                                    #{item.consultation.appointment.patient.displayId}
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-xs text-teal-600 font-medium mt-1">
                                            By Dr. {item.consultation.appointment.doctor.name}
                                        </p>
                                    </div>
                                    <div className="bg-teal-50 text-teal-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase">
                                        Dispensed
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-50">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Prescribed Medicines</p>
                                    <div className="flex flex-wrap gap-2">
                                        {item.items.map((drug: any, i: number) => (
                                            <span key={i} className="px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg border border-gray-100 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                                                {drug.medicine.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden lg:grid grid-cols-4 items-center gap-4">
                                <div className="text-gray-600 text-sm">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </div>
                                <div className="font-bold text-gray-800">
                                    {item.consultation.appointment.patient.name}
                                </div>
                                <div className="text-gray-600 text-sm font-medium">
                                    Dr. {item.consultation.appointment.doctor.name}
                                </div>
                                <div>
                                    <div className="flex flex-wrap gap-2">
                                        {item.items.map((drug: any, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-md border border-green-100">
                                                {drug.medicine.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
