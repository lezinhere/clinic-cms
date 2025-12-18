import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { patientApi } from "../api/patient";

const STEPS = ["My Details", "Select Doctor", "Choose Slot", "Confirm"];

export default function BookingWizard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(0);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        age: "",
        sex: "",
        phone: "",
        doctorId: "",
        date: "",
    });

    useEffect(() => {
        patientApi.getDoctors().then(res => setDoctors(res.data));
        if (user && user.role === "PATIENT") {
            setFormData(prev => ({
                ...prev,
                name: user.name || "",
                age: user.age || "",
                sex: user.sex || "",
                phone: user.phone || ""
            }));
        }
    }, [user]);

    const handleNext = () => {
        if (currentStep === 0) {
            if (!formData.name || !formData.age || !formData.sex || !formData.phone) {
                alert("Please fill all details");
                return;
            }
            if (!/^\d{10}$/.test(formData.phone)) {
                alert("Phone number must be exactly 10 digits");
                return;
            }
        }
        if (currentStep === 1 && !formData.doctorId) {
            alert("Please select a doctor");
            return;
        }
        if (currentStep === 2 && !formData.date) {
            alert("Please select a time slot");
            return;
        }
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => setCurrentStep(prev => prev - 1);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const res = await patientApi.bookAppointment({
                patientId: user?.role === "PATIENT" ? user.id : null,
                doctorId: formData.doctorId,
                date: formData.date,
                guestDetails: {
                    name: formData.name,
                    age: formData.age,
                    sex: formData.sex,
                    phone: formData.phone
                }
            });

            if (res.data.success) {
                setCurrentStep(4);
            } else {
                alert("Booking Failed: " + (res.data.error || ""));
            }
        } catch (err) {
            alert("Connection error during booking");
        }
        setLoading(false);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800">Primary Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Patient Full Name</label>
                                <input
                                    className="w-full p-4 border rounded-2xl bg-gray-50 focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Age</label>
                                    <input
                                        type="number"
                                        className="w-full p-4 border rounded-2xl bg-gray-50 focus:ring-2 focus:ring-teal-500 font-medium"
                                        value={formData.age}
                                        onChange={e => setFormData({ ...formData, age: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Sex</label>
                                    <select
                                        className="w-full p-4 border rounded-2xl bg-gray-50 focus:ring-2 focus:ring-teal-500 font-medium"
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
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">10-Digit Mobile Number</label>
                                <input
                                    className="w-full p-4 border rounded-2xl bg-gray-50 focus:ring-2 focus:ring-teal-500 font-medium"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800">Available Specialists</h2>
                        <div className="grid gap-3">
                            {doctors.map(doc => (
                                <div
                                    key={doc.id}
                                    onClick={() => setFormData({ ...formData, doctorId: doc.id })}
                                    className={`p-6 border-2 rounded-[2rem] cursor-pointer transition-all flex items-center gap-4 ${formData.doctorId === doc.id
                                        ? "border-teal-500 bg-teal-50/50 shadow-md"
                                        : "hover:bg-gray-50 border-gray-100"
                                        }`}
                                >
                                    <div className="h-14 w-14 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xl font-bold">
                                        Dr
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 text-lg">{doc.name}</div>
                                        <div className="text-sm text-teal-600 font-bold uppercase tracking-wider">
                                            {doc.specialization || "General Physician"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800">Choose Appointment Date</h2>
                        <input
                            type="datetime-local"
                            className="w-full p-6 border-2 border-gray-100 rounded-[2rem] bg-gray-50 text-xl font-bold text-teal-700 outline-none focus:border-teal-500 transition-colors"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                        <p className="text-gray-400 font-medium text-center">Secure your slot in the clinic schedule.</p>
                    </div>
                );
            case 3:
                const doc = doctors.find(d => d.id === formData.doctorId);
                return (
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold text-gray-800 text-center">Final Review</h2>
                        <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 space-y-6">
                            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Patient</span>
                                <span className="font-bold text-gray-800">{formData.name}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Specialist</span>
                                <span className="font-bold text-teal-600">{doc?.name}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scheduled For</span>
                                <span className="font-bold text-gray-800">{new Date(formData.date).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="text-center py-10">
                        <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-lg shadow-green-100 italic">
                            ✓
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Booking confirmed!</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">
                            Your session with {doctors.find(d => d.id === formData.doctorId)?.name} is successfully scheduled.
                        </p>
                        <div className="bg-indigo-50 text-indigo-700 p-6 rounded-3xl mb-10 flex items-center gap-4 text-left border border-indigo-100">
                            <div className="text-3xl">📱</div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-60">Instant Confirmation</p>
                                <p className="text-sm font-bold">A digital token has been sent to {formData.phone} for your records.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate("/patient/login")}
                            className="w-full py-4 bg-teal-600 text-white rounded-2xl hover:bg-teal-700 font-bold shadow-xl shadow-teal-100 transition-all active:scale-95"
                        >
                            Monitor Appointment Progress
                        </button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-white py-12 px-6">
            <div className="max-w-2xl mx-auto">
                {currentStep < 4 && (
                    <div className="mb-12 flex justify-between relative px-2">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-0"></div>
                        {STEPS.map((step, idx) => (
                            <div key={idx} className="relative z-10 flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${idx <= currentStep ? "bg-teal-600 text-white shadow-lg shadow-teal-100" : "bg-white border-2 border-gray-100 text-gray-300"}`}>
                                    {idx + 1}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest mt-3 whitespace-nowrap ${idx <= currentStep ? "text-teal-700" : "text-gray-300"}`}>
                                    {step}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-gray-50 min-h-[500px] flex flex-col justify-between relative overflow-hidden">
                    {/* Animated side blob */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>

                    <div className="relative z-10">{renderStep()}</div>

                    {currentStep < 4 && (
                        <div className="flex gap-4 mt-12 pt-8 border-t border-gray-50 relative z-10">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 0}
                                className="flex-1 py-4 text-gray-400 hover:text-gray-600 font-bold transition-colors disabled:opacity-30"
                            >
                                ← Prev
                            </button>
                            {currentStep === 3 ? (
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className="flex-[2] py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold shadow-xl shadow-teal-100 transition-all active:scale-95"
                                >
                                    {loading ? "Registering..." : "Finalize Appointment"}
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className="flex-[2] py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold shadow-xl shadow-teal-100 transition-all active:scale-95 flex items-center justify-center"
                                >
                                    Proceed →
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

