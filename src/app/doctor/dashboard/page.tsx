"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { getDoctorAppointments, getDoctorConsultationHistory } from "@/app/actions/doctor"
import Link from "next/link"

export default function DoctorDashboard() {
    const { user } = useAuth()
    const [tab, setTab] = useState<'UPCOMING' | 'HISTORY'>('UPCOMING')
    const [appointments, setAppointments] = useState<any[]>([])
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        if (user && user.role === "DOCTOR") {
            setLoading(true)
            Promise.all([
                getDoctorAppointments(user.id),
                getDoctorConsultationHistory(user.id, searchQuery)
            ]).then(([upcoming, past]) => {
                setAppointments(upcoming)
                setHistory(past)
                setLoading(false)
            })
        }
    }, [user, searchQuery])

    const todayCount = appointments.filter(apt => {
        const aptDate = new Date(apt.date)
        const today = new Date()
        return aptDate.toDateString() === today.toDateString()
    }).length

    if (!user) return <div className="p-8">Please log in as Doctor.</div>

    return (
        <div className="max-w-5xl mx-auto p-6">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500">Welcome back, {user.name}</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                    <span className="text-gray-500 text-sm">Today's Appointments:</span>
                    <span className="ml-2 font-bold text-blue-600 text-xl">{todayCount}</span>
                </div>
            </header>

            {/* Tabs & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-100">
                <div className="flex gap-4">
                    <button
                        onClick={() => setTab('UPCOMING')}
                        className={`pb-2 px-1 font-medium text-sm transition-colors ${tab === 'UPCOMING' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Upcoming Schedule
                    </button>
                    <button
                        onClick={() => setTab('HISTORY')}
                        className={`pb-2 px-1 font-medium text-sm transition-colors ${tab === 'HISTORY' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Consultation History
                    </button>
                </div>

                {tab === 'HISTORY' && (
                    <div className="pb-3 w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search Name or User ID..."
                            className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {loading ? (
                <div className="text-gray-500 animate-pulse">Loading data...</div>
            ) : (
                <>
                    {/* UPCOMING VIEW */}
                    {tab === 'UPCOMING' && (
                        appointments.length === 0 ? (
                            <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
                                <p className="text-gray-500">No upcoming appointments found.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {appointments.map((apt) => (
                                    <div key={apt.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg">
                                                {apt.patient.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">{apt.patient.name}</h3>
                                                <div className="text-sm text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                                                    <span>{apt.patient.age} yrs</span>
                                                    <span>{apt.patient.sex}</span>
                                                    <span className="font-medium text-blue-600 underline underline-offset-4 decoration-blue-200">
                                                        {new Date(apt.date).toLocaleDateString() !== new Date().toLocaleDateString() && (
                                                            <span className="mr-1">{new Date(apt.date).toLocaleDateString()}</span>
                                                        )}
                                                        {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full sm:w-auto">
                                            <Link
                                                href={`/doctor/consult/${apt.id}`}
                                                className="block sm:inline-block text-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                                            >
                                                Start Consult
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* HISTORY VIEW */}
                    {tab === 'HISTORY' && (
                        <div className="grid gap-4">
                            {/* Desktop Table Header (hidden on mobile) */}
                            <div className="hidden md:grid grid-cols-4 bg-gray-50 p-4 rounded-xl text-xs uppercase font-bold text-gray-500 tracking-wider">
                                <div>Date</div>
                                <div>Patient</div>
                                <div>Diagnosis</div>
                                <div>Action</div>
                            </div>

                            {history.map((apt) => (
                                <div key={apt.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    {/* Mobile/Default Layout (Stacked) */}
                                    <div className="md:hidden space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(apt.date).toLocaleDateString()}</p>
                                                <h3 className="text-lg font-bold text-gray-900">{apt.patient.name}</h3>
                                                <p className="text-[10px] font-mono text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded inline-block mt-1">
                                                    {apt.patient.displayId || 'PID-NEW'}
                                                </p>
                                            </div>
                                            <Link
                                                href={`/patient/history?patientId=${apt.patient.id}`}
                                                className="text-teal-600 font-bold text-sm bg-teal-50 px-3 py-1 rounded-full whitespace-nowrap"
                                            >
                                                History →
                                            </Link>
                                        </div>
                                        <div className="pt-3 border-t border-gray-50">
                                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Diagnosis</p>
                                            <p className="text-gray-700 text-sm font-medium">{apt.consultation?.diagnosis || "No summary recorded"}</p>
                                        </div>
                                    </div>

                                    {/* Desktop Row Layout (hidden on mobile) */}
                                    <div className="hidden md:grid grid-cols-4 items-center">
                                        <div className="text-gray-600 text-sm">
                                            {new Date(apt.date).toLocaleDateString()}
                                        </div>
                                        <div className="font-bold text-gray-800">
                                            {apt.patient.name}
                                        </div>
                                        <div className="text-gray-600 text-sm truncate pr-4">
                                            {apt.consultation?.diagnosis || "N/A"}
                                        </div>
                                        <div>
                                            <Link
                                                href={`/patient/history?patientId=${apt.patient.id}`}
                                                className="text-teal-600 hover:underline text-sm font-bold"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {history.length === 0 && (
                                <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100 italic text-gray-400">
                                    No past consultations found.
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
