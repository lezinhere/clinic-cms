"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { getPatientHistory } from "@/app/actions/patient"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

export default function HistoryPageWrapper() {
    return (
        <Suspense fallback={<div className="p-8">Loading history parameters...</div>}>
            <HistoryContent />
        </Suspense>
    )
}

function HistoryContent() {
    const { user } = useAuth()
    const searchParams = useSearchParams()
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            // If doctor and patientId is provided, fetch for that patient
            // Otherwise fetch for logged in user (patient)
            const paramId = searchParams.get('patientId')
            const targetId = (user.role === 'DOCTOR' && paramId) ? paramId : user.id

            getPatientHistory(targetId).then((data) => {
                setAppointments(data)
                setLoading(false)
            })
        }
    }, [user, searchParams])

    if (!user) return <div className="p-8">Please log in.</div>
    if (loading) return <div className="p-8">Loading history...</div>

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Medical History</h1>

            <div className="space-y-6">
                {appointments.length === 0 && (
                    <p className="text-gray-500">No history found.</p>
                )}

                {appointments.map((apt) => (
                    <div key={apt.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                            <div>
                                <span className="font-semibold text-gray-800">
                                    {new Date(apt.date).toLocaleDateString()} at {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="mx-2 text-gray-400">|</span>
                                <span className="text-gray-600">Dr. {apt.doctor.name}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                apt.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                {apt.status}
                            </span>
                        </div>

                        {apt.consultation && (
                            <div className="p-6 space-y-4">
                                {/* Diagnosis */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Diagnosis</h4>
                                    <p className="mt-1 text-gray-800">{apt.consultation.diagnosis || "No diagnosis recorded."}</p>
                                </div>

                                {/* Notes */}
                                {apt.consultation.notes && (
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Notes</h4>
                                        <p className="mt-1 text-gray-800 italic">{apt.consultation.notes}</p>
                                    </div>
                                )}

                                {/* Prescriptions */}
                                {apt.consultation.prescriptions.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Prescriptions</h4>
                                        <ul className="space-y-2">
                                            {apt.consultation.prescriptions.flatMap((p: any) => p.items).map((item: any) => (
                                                <li key={item.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                                                    <span className="font-medium text-blue-900">{item.medicine.name}</span>
                                                    <span className="text-sm text-blue-700">{item.dosage} ({item.duration})</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Lab Reports */}
                                {apt.consultation.labRequests.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Lab Reports</h4>
                                        <div className="grid gap-2">
                                            {apt.consultation.labRequests.map((lab: any) => (
                                                <div key={lab.id} className="p-3 border rounded-lg flex justify-between items-center">
                                                    <span className="font-medium">{lab.testName}</span>
                                                    {lab.status === 'COMPLETED' ? (
                                                        lab.resultReport?.startsWith('PDF Report:') ? (
                                                            <a href="#" className="text-blue-600 underline text-sm flex items-center gap-1">
                                                                📄 {lab.resultReport}
                                                            </a>
                                                        ) : (
                                                            <span className="text-green-600 font-semibold">{lab.resultReport}</span>
                                                        )
                                                    ) : (
                                                        <span className="text-yellow-600 text-sm">Pending</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
