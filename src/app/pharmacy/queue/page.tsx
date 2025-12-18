"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { getPharmacyQueue, dispensePrescription } from "@/app/actions/staff"

export default function PharmacyPage() {
    const { user } = useAuth()
    const [queue, setQueue] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user && user.role === "PHARMACY") {
            getPharmacyQueue().then(data => {
                setQueue(data)
                setLoading(false)
            })
        }
    }, [user])

    const handleDispense = async (id: string) => {
        if (confirm("Confirm dispense medicines to patient?")) {
            await dispensePrescription(id)
            setQueue(queue.filter(q => q.id !== id))
        }
    }

    if (!user) return <div className="p-8">Please log in as Pharmacist.</div>

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Pharmacy Queue</h1>
                <a href="/pharmacy/history" className="text-teal-600 font-medium hover:underline">View History →</a>
            </div>

            {loading ? (
                <div>Loading queue...</div>
            ) : queue.length === 0 ? (
                <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                    No pending prescriptions.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {queue.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {item.consultation.appointment.patient.name}
                                        <span className="text-gray-500 text-sm font-medium ml-2">
                                            ({item.consultation.appointment.patient.sex}, {item.consultation.appointment.patient.age}Y)
                                        </span>
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Prescribed by Dr. {item.consultation.appointment.doctor.name} on {new Date(item.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDispense(item.id)}
                                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-green-600/20"
                                >
                                    Mark Dispensed
                                </button>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-900 mb-2 border-b border-blue-200 pb-2">Medicines</h4>
                                <ul className="space-y-2">
                                    {item.items.map((med: any) => (
                                        <li key={med.id} className="flex justify-between">
                                            <span className="font-medium">{med.medicine.name}</span>
                                            <span className="text-blue-700">{med.dosage} ({med.duration})</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
