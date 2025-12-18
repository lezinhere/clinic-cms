"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { getLabRequests, completeLabRequest } from "@/app/actions/staff"

export default function LabPage() {
    const { user } = useAuth()
    const [queue, setQueue] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user && user.role === "LAB") {
            getLabRequests().then(data => {
                setQueue(data)
                setLoading(false)
            })
        }
    }, [user])

    const handleComplete = async (id: string) => {
        // Simulate File Upload
        const fileInput = document.createElement("input")
        fileInput.type = "file"
        fileInput.accept = "application/pdf"

        fileInput.onchange = async (e: any) => {
            const file = e.target.files[0]
            if (file) {
                const fakeUrl = `https://clinic-storage.com/reports/${file.name}` // Mock URL
                // In real app, upload formData here
                setLoading(true)
                await completeLabRequest(id, `PDF Report: ${file.name}`)
                setQueue(queue.filter(q => q.id !== id))
                setLoading(false)
            }
        }
        fileInput.click()
    }

    if (!user) return <div className="p-8">Please log in as Lab Technician.</div>

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Lab Request Queue</h1>
                <a href="/lab/history" className="text-purple-600 font-medium hover:underline">View History →</a>
            </div>

            {loading ? (
                <div>Loading queue...</div>
            ) : queue.length === 0 ? (
                <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                    No pending lab requests.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {queue.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="w-full">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-gray-800">{item.testName}</h3>
                                    <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">PENDING</span>
                                </div>
                                <p className="text-gray-700 font-medium">Patient: <span className="font-bold">{item.consultation.appointment.patient.name}</span>
                                    <span className="text-gray-400 text-sm ml-2 font-normal">
                                        ({item.consultation.appointment.patient.sex}, {item.consultation.appointment.patient.age}Y)
                                    </span>
                                </p>
                                <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-tighter">
                                    Ordered by Dr. {item.consultation.appointment.doctor.name}
                                </p>
                            </div>

                            <button
                                onClick={() => handleComplete(item.id)}
                                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-purple-600/20"
                            >
                                Complete / Upload
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
