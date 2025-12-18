"use client"

import React, { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { searchMedicines, searchLabTests, submitConsultation, getAppointmentDetails } from "@/app/actions/doctor"

export default function ConsultPageWrapper({ params }: { params: Promise<{ aptId: string }> }) {
    const { aptId } = use(params)
    return <ConsultInterface aptId={aptId} />
}

function ConsultInterface({ aptId }: { aptId: string }) {
    const router = useRouter()

    // Data State
    const [patient, setPatient] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [showSummary, setShowSummary] = useState(false) // V4: Summary Modal

    // Form State
    const [diagnosis, setDiagnosis] = useState("")
    const [notes, setNotes] = useState("")
    const [nextVisit, setNextVisit] = useState("")

    // Medicines State
    const [medQuery, setMedQuery] = useState("")
    const [medSuggestions, setMedSuggestions] = useState<{ id: string, name: string }[]>([])
    const [prescriptions, setPrescriptions] = useState<{ medicineName: string, dosage: string, period: string }[]>([])

    // Lab State (V4: Dynamic)
    const [labQuery, setLabQuery] = useState("")
    const [labSuggestions, setLabSuggestions] = useState<{ id: string, name: string }[]>([])
    const [labRequests, setLabRequests] = useState<{ testName: string }[]>([])

    // Load Appointment & Patient
    useEffect(() => {
        getAppointmentDetails(aptId).then(apt => {
            if (apt) {
                setPatient(apt.patient)
            }
        })
    }, [aptId])

    // Search Medicines Debounce
    useEffect(() => {
        const delay = setTimeout(() => {
            if (medQuery.length > 1) {
                searchMedicines(medQuery).then(setMedSuggestions)
            } else {
                setMedSuggestions([])
            }
        }, 300)
        return () => clearTimeout(delay)
    }, [medQuery])

    // Search Lab Tests Debounce (V4)
    useEffect(() => {
        const delay = setTimeout(() => {
            if (labQuery.length > 1) {
                searchLabTests(labQuery).then(setLabSuggestions)
            } else {
                setLabSuggestions([])
            }
        }, 300)
        return () => clearTimeout(delay)
    }, [labQuery])

    const addMedicine = (name: string) => {
        setPrescriptions([...prescriptions, { medicineName: name, dosage: "1-0-1", period: "5 Days" }])
        setMedQuery("")
        setMedSuggestions([])
    }

    const removeMedicine = (index: number) => {
        const newPs = [...prescriptions]
        newPs.splice(index, 1)
        setPrescriptions(newPs)
    }

    // V4: Add Lab Test
    const addLab = (name: string) => {
        setLabRequests([...labRequests, { testName: name }])
        setLabQuery("")
        setLabSuggestions([])
    }

    const handlePreSubmit = () => {
        if (!diagnosis) {
            alert("Please enter a diagnosis")
            return
        }
        setShowSummary(true)
    }

    const handleConfirmSubmit = async () => {
        setLoading(true)
        const summary = `${notes}\n\nNext Visit: ${nextVisit}`

        const mappedPrescriptions = prescriptions.map(p => ({
            medicineName: p.medicineName,
            dosage: p.dosage,
            duration: p.period
        }))

        const res = await submitConsultation(aptId, diagnosis, summary, nextVisit || null, mappedPrescriptions, labRequests)

        if (res.success) {
            // alert(`Consultation Completed!\n\nRx sent to Pharmacy.\nLab Request sent to Lab.\n\nSimulated WhatsApp sent to ${patient?.name}`)
            router.push("/doctor/dashboard")
        } else {
            alert(`Failed to submit: ${res.error}`)
            setLoading(false)
            setShowSummary(false)
        }
    }

    if (!patient) return (
        <div className="min-h-screen flex items-center justify-center text-teal-600 animate-pulse">
            Loading Patient Records...
        </div>
    )

    return (
        <div className="max-w-6xl mx-auto p-6 pb-24 relative">
            {/* V4: Summary Modal Overlay */}
            {showSummary && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-gray-800">Review Consultation</h2>
                            <button onClick={() => setShowSummary(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">×</button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Patient</h3>
                                <p className="text-lg font-bold text-gray-900">{patient.name} <span className="font-normal text-gray-500">({patient.age}, {patient.sex})</span></p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Diagnosis</h3>
                                    <p className="font-medium text-gray-800">{diagnosis}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Next Visit</h3>
                                    <p className="font-medium text-gray-800">{nextVisit || "Not Scheduled"}</p>
                                </div>
                            </div>

                            {prescriptions.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Prescription ({prescriptions.length})</h3>
                                    <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                                        {prescriptions.map((p, i) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="font-semibold text-gray-800">{p.medicineName}</span>
                                                <span className="text-gray-600">{p.dosage} • {p.period}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {labRequests.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Lab Requests ({labRequests.length})</h3>
                                    <div className="bg-purple-50 rounded-xl p-4 flex flex-wrap gap-2">
                                        {labRequests.map((l, i) => (
                                            <span key={i} className="px-3 py-1 bg-white border border-purple-100 rounded-full text-sm text-purple-700 font-medium">
                                                {l.testName}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {notes && (
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Notes</h3>
                                    <p className="text-sm text-gray-600 italic">"{notes}"</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => setShowSummary(false)}
                                className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                Edit Details
                            </button>
                            <button
                                onClick={handleConfirmSubmit}
                                disabled={loading}
                                className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                {loading ? "Signing & Sending..." : "Confirm & Send"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Consultation Room</h1>
                    <p className="text-sm text-gray-400">APT ID: {aptId}</p>
                </div>
                <button
                    onClick={() => router.push("/doctor/dashboard")}
                    className="text-gray-500 hover:text-gray-700 font-medium"
                >
                    Exit
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Patient Info & Diagnosis */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-teal-500">
                        <div className="flex flex-col items-center text-center">
                            <div className="h-20 w-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
                                {patient.name.charAt(0)}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
                            <p className="text-gray-500 text-sm mt-1">{patient.sex}, {patient.age} Years</p>
                            <div className="mt-6 w-full grid grid-cols-2 gap-4 text-left bg-gray-50 p-4 rounded-xl">
                                <div>
                                    <span className="text-xs text-gray-400 uppercase font-bold">Phone</span>
                                    <p className="font-medium text-gray-700">{patient.phone || "N/A"}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 uppercase font-bold">Last Visit</span>
                                    <p className="font-medium text-gray-700">First Time</p>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push(`/patient/history?patientId=${patient.id}`)}
                                className="mt-4 w-full py-2 bg-white border border-gray-300 rounded-xl text-teal-700 font-bold hover:bg-teal-50 transition-colors shadow-sm text-sm"
                            >
                                📜 View Medical History
                            </button>
                        </div>
                    </div>

                    {/* Diagnosis Panel */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            📝 Clinical Diagnosis
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Diagnosis / Condition</label>
                                <input
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                                    placeholder="e.g. Acute Viral Fever"
                                    value={diagnosis}
                                    onChange={e => setDiagnosis(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Next Visit Date</label>
                                <input
                                    type="date"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={nextVisit}
                                    onChange={e => setNextVisit(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Summary / Notes</label>
                                <textarea
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none h-32 resize-none"
                                    placeholder="Clinical observations, advice..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Prescription & Labs */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Prescription */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
                        <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2">
                            💊 Prescribe Medicine
                        </h3>

                        {/* Search Medicine */}
                        <div className="relative mb-6">
                            <input
                                className="w-full p-4 pl-12 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Search medicine database..."
                                value={medQuery}
                                onChange={e => setMedQuery(e.target.value)}
                            />
                            <span className="absolute left-4 top-4 text-gray-400">🔍</span>

                            {/* Suggestions Dropdown */}
                            {medSuggestions.length > 0 && (
                                <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                                    {medSuggestions.map(m => (
                                        <div
                                            key={m.id}
                                            onClick={() => addMedicine(m.name)}
                                            className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center group"
                                        >
                                            <span className="font-medium text-gray-700">{m.name}</span>
                                            <span className="text-blue-500 text-sm opacity-0 group-hover:opacity-100">Select</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {medQuery.length > 0 && medSuggestions.length === 0 && (
                                <button
                                    onClick={() => addMedicine(medQuery)}
                                    className="absolute right-3 top-3 px-4 py-1.5 bg-teal-100 text-teal-700 text-sm font-bold rounded-lg hover:bg-teal-200 transition-colors"
                                >
                                    Add New
                                </button>
                            )}
                        </div>

                        {/* Rx Table */}
                        <div className="overflow-hidden rounded-xl border border-gray-100">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                    <tr>
                                        <th className="p-4 w-16">Sl.No</th>
                                        <th className="p-4">Medicine Name</th>
                                        <th className="p-4 w-32">Dosage</th>
                                        <th className="p-4 w-32">Period</th>
                                        <th className="p-4 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {prescriptions.map((p, idx) => (
                                        <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-gray-500 font-mono">{idx + 1}</td>
                                            <td className="p-4 font-semibold text-gray-800">{p.medicineName}</td>
                                            <td className="p-4">
                                                <input
                                                    className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 outline-none text-sm"
                                                    value={p.dosage}
                                                    onChange={e => {
                                                        const newPs = [...prescriptions]
                                                        newPs[idx].dosage = e.target.value
                                                        setPrescriptions(newPs)
                                                    }}
                                                />
                                            </td>
                                            <td className="p-4">
                                                <input
                                                    className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 outline-none text-sm"
                                                    value={p.period}
                                                    onChange={e => {
                                                        const newPs = [...prescriptions]
                                                        newPs[idx].period = e.target.value
                                                        setPrescriptions(newPs)
                                                    }}
                                                />
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => removeMedicine(idx)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors text-xl leading-none"
                                                >
                                                    ×
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {prescriptions.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-400 italic">
                                                No medicines prescribed yet. Search above to add.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Lab & Submit */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                            🧪 Lab Requests
                        </h3>
                        <div className="relative mb-6">
                            <div className="flex gap-3">
                                <input
                                    className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="Search Test Database... (e.g. CBC)"
                                    value={labQuery}
                                    onChange={e => setLabQuery(e.target.value)}
                                />
                            </div>

                            {/* Lab Suggestions */}
                            {labSuggestions.length > 0 && (
                                <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                                    {labSuggestions.map(l => (
                                        <div
                                            key={l.id}
                                            onClick={() => addLab(l.name)}
                                            className="p-3 hover:bg-purple-50 cursor-pointer flex justify-between items-center group"
                                        >
                                            <span className="font-medium text-gray-700">{l.name}</span>
                                            <span className="text-purple-500 text-sm opacity-0 group-hover:opacity-100">Add</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {labQuery.length > 0 && labSuggestions.length === 0 && (
                                <button
                                    onClick={() => addLab(labQuery)}
                                    className="absolute right-3 top-2 px-4 py-1.5 bg-purple-100 text-purple-700 text-sm font-bold rounded-lg hover:bg-purple-200 transition-colors"
                                >
                                    + Add New
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {labRequests.map((l, idx) => (
                                <span key={idx} className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm border border-purple-100">
                                    {l.testName}
                                    <button
                                        onClick={() => {
                                            const newL = [...labRequests]
                                            newL.splice(idx, 1)
                                            setLabRequests(newL)
                                        }}
                                        className="hover:text-purple-900"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            {labRequests.length === 0 && <span className="text-gray-400 italic text-sm">No tests requested.</span>}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handlePreSubmit}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                        >
                            Review & Submit
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-4">
                            You will review the summary before final signature.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
