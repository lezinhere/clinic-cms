"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { getDoctors, bookAppointment } from "@/app/actions/patient"
import { useRouter } from "next/navigation"

type Doctor = {
    id: string
    name: string
    specialization?: string | null
}

const STEPS = ["My Details", "Select Doctor", "Choose Slot", "Confirm"]

export default function BookingWizard() {
    const { user } = useAuth()
    const router = useRouter()

    const [currentStep, setCurrentStep] = useState(0)
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [loading, setLoading] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        name: user?.role === "PATIENT" ? user.name : "",
        age: user?.role === "PATIENT" ? (user as any).age || "" : "",
        sex: user?.role === "PATIENT" ? (user as any).sex || "" : "",
        phone: user?.role === "PATIENT" ? (user as any).phone || "" : "",
        doctorId: "",
        date: "",
    })

    // Load doctors on mount
    useEffect(() => {
        getDoctors().then(setDoctors)
        // Pre-fill user data if available and user is a PATIENT
        if (user && user.role === "PATIENT") {
            setFormData(prev => ({
                ...prev,
                name: user.name,
                age: (user as any).age || "",
                sex: (user as any).sex || "",
                phone: (user as any).phone || "",
            }))
        }
    }, [user])

    const handleNext = () => {
        // Validation
        if (currentStep === 0) {
            if (!formData.name || !formData.age || !formData.sex || !formData.phone) {
                alert("Please fill all details")
                return
            }
            // Phone Validation: 10 Digits
            if (!/^\d{10}$/.test(formData.phone)) {
                alert("Phone number must be exactly 10 digits")
                return
            }
        }
        if (currentStep === 1 && !formData.doctorId) {
            alert("Please select a doctor")
            return
        }
        if (currentStep === 2 && !formData.date) {
            alert("Please select a time slot")
            return
        }

        setCurrentStep(prev => prev + 1)
    }

    const handleBack = () => {
        setCurrentStep(prev => prev - 1)
    }

    const handleConfirm = async () => {
        setLoading(true)
        const dateObj = new Date(formData.date)

        const guestDetails = {
            name: formData.name,
            age: formData.age,
            sex: formData.sex,
            phone: formData.phone
        }

        const res = await bookAppointment(
            user?.role === "PATIENT" ? user.id : null,
            formData.doctorId,
            dateObj,
            guestDetails
        )

        setLoading(false)
        if (res.success) {
            setCurrentStep(4) // Success Step
        } else {
            alert("Booking Failed: " + (res.error || ""))
        }
    }

    // Render Steps
    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-bold text-gray-800">Step 1: Patient Details</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    className="w-full p-3 border rounded-lg bg-gray-50 mt-1"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Age</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 border rounded-lg bg-gray-50 mt-1"
                                        value={formData.age}
                                        onChange={e => setFormData({ ...formData, age: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sex</label>
                                    <select
                                        className="w-full p-3 border rounded-lg bg-gray-50 mt-1"
                                        value={formData.sex}
                                        onChange={e => setFormData({ ...formData, sex: e.target.value })}
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    className="w-full p-3 border rounded-lg bg-gray-50 mt-1"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )
            case 1:
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-bold text-gray-800">Step 2: Choose Doctor</h2>
                        <div className="grid grid-cols-1 gap-3">
                            {doctors.map(doc => (
                                <div
                                    key={doc.id}
                                    onClick={() => setFormData({ ...formData, doctorId: doc.id })}
                                    className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center gap-4 ${formData.doctorId === doc.id
                                        ? "border-teal-500 bg-teal-50 ring-2 ring-teal-200"
                                        : "hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="h-12 w-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold shrink-0">
                                        Dr
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800">{doc.name}</div>
                                        <div className="text-sm text-teal-600 font-medium">
                                            {doc.specialization || "General Physician"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-bold text-gray-800">Step 3: Select Date & Time</h2>
                        <input
                            type="datetime-local"
                            className="w-full p-4 border rounded-xl bg-gray-50 text-lg"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                        <p className="text-sm text-gray-500">Pick a convenient slot for your visit.</p>
                    </div>
                )
            case 3:
                const docName = doctors.find(d => d.id === formData.doctorId)?.name
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-bold text-gray-800">Step 4: Confirm Details</h2>

                        <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Patient</span>
                                <span className="font-semibold">{formData.name}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Doctor</span>
                                <span className="font-semibold">{docName}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Slot</span>
                                <span className="font-semibold">{new Date(formData.date).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Contact</span>
                                <span className="font-semibold">{formData.phone}</span>
                            </div>
                        </div>
                    </div>
                )
            case 4:
                return (
                    <div className="text-center py-10 animate-in zoom-in duration-300">
                        <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                            ✓
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-500 mb-2 max-w-sm mx-auto">
                            Appointment scheduled with {doctors.find(d => d.id === formData.doctorId)?.name} on {new Date(formData.date).toLocaleDateString()}.
                        </p>
                        <div className="bg-blue-50 text-blue-700 p-4 rounded-xl mb-8 flex items-center gap-3">
                            <span className="text-2xl">📱</span>
                            <p className="text-sm font-medium">A confirmation SMS has been sent to {formData.phone} with your appointment details.</p>
                        </div>
                        <button
                            onClick={() => router.push("/patient/login")}
                            className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
                        >
                            View My History
                        </button>
                    </div>
                )
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Progress Bar */}
                {currentStep < 4 && (
                    <div className="mb-8 flex justify-between relative px-4">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0"></div>
                        {STEPS.map((step, idx) => (
                            <div key={idx} className="relative z-10 flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${idx <= currentStep ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-500"
                                    }`}>
                                    {idx + 1}
                                </div>
                                <span className={`text-xs mt-2 font-medium ${idx <= currentStep ? "text-teal-700" : "text-gray-400"}`}>
                                    {step}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col justify-between">
                    {renderStep()}

                    {currentStep < 4 && (
                        <div className="flex justify-between mt-8 pt-6 border-t">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 0}
                                className="px-6 py-2 text-gray-500 hover:text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Back
                            </button>
                            {currentStep === 3 ? (
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className="px-8 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                                >
                                    {loading ? "Confirming..." : "Confirm Booking"}
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                                >
                                    Next Step →
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
