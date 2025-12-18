"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { getLabHistory } from "@/app/actions/staff"
import Link from "next/link"

export default function LabHistoryPage() {
    const { user } = useAuth()
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        if (user && user.role === "LAB") {
            getLabHistory(searchQuery).then(data => {
                setHistory(data)
                setLoading(false)
            })
        }
    }, [user, searchQuery])

    if (!user) return <div className="p-8">Please log in as Lab Technician.</div>

    return (
        <div className="max-w-6xl mx-auto p-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Lab History</h1>
                    <Link href="/lab/requests" className="text-purple-600 font-medium hover:underline text-sm">
                        ← Back to Pending Requests
                    </Link>
                </div>
                <div className="w-full md:w-72">
                    <input
                        type="text"
                        placeholder="Search Name or PID..."
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            {loading ? (
                <div>Loading history...</div>
            ) : history.length === 0 ? (
                <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                    No completed lab tests found.
                </div>
            ) : (
                <div className="grid gap-4">
                    {/* Desktop Header */}
                    <div className="hidden md:grid grid-cols-4 bg-gray-50 p-4 rounded-xl text-xs uppercase font-bold text-gray-500 tracking-wider">
                        <div>Date</div>
                        <div>Test Name</div>
                        <div>Patient</div>
                        <div>Report/Result</div>
                    </div>

                    {history.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            {/* Mobile Layout */}
                            <div className="md:hidden space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.testName}</h3>
                                    </div>
                                    <div className="bg-purple-50 text-purple-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase whitespace-nowrap">
                                        Completed
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 pt-3 border-t border-gray-50">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Patient</p>
                                        <p className="text-gray-700 font-medium">
                                            {item.consultation.appointment.patient.name}
                                            {item.consultation.appointment.patient.displayId && (
                                                <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-mono">
                                                    #{item.consultation.appointment.patient.displayId}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Result</p>
                                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 italic break-words">
                                            {item.resultReport}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden md:grid grid-cols-4 items-center gap-4">
                                <div className="text-gray-600 text-sm">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </div>
                                <div className="font-bold text-gray-800">
                                    {item.testName}
                                </div>
                                <div className="text-gray-600">
                                    {item.consultation.appointment.patient.name}
                                </div>
                                <div className="text-sm text-gray-500 truncate italic">
                                    {item.resultReport}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
