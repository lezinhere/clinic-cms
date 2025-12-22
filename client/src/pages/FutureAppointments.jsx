import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doctorApi } from "../api/doctor";

export default function FutureAppointments() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role === "DOCTOR") {
            setLoading(true);
            doctorApi.getAppointments(user.id)
                .then(res => {
                    // Filter for FUTURE ONLY (After today)
                    const today = new Date();
                    today.setHours(23, 59, 59, 999);

                    const future = res.data.filter(apt => new Date(apt.date) > today);
                    setAppointments(future);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [user]);

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this future appointment?")) return;
        try {
            await doctorApi.cancelAppointment(id);
            setAppointments(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            alert("Failed to cancel");
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Future Appointments</h1>
                <p className="text-gray-500">Upcoming schedule beyond today</p>
            </header>

            {loading ? (
                <div className="p-12 text-center text-gray-400">Loading schedule...</div>
            ) : appointments.length === 0 ? (
                <div className="p-12 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
                    <p className="text-gray-400">No matching appointments found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {appointments.map((apt) => (
                        <div key={apt.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                    {apt.patient.name[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{apt.patient.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {apt.patient.age} yrs • {apt.patient.sex} • <span className="text-blue-600 font-medium">{new Date(apt.date).toDateString()}</span>
                                    </p>
                                    <div className="flex gap-2 mt-1">
                                        {apt.slotTime && <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md font-medium">{apt.slotTime}</span>}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <button
                                    onClick={() => handleCancel(apt.id)}
                                    className="px-4 py-2 border border-red-100 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
