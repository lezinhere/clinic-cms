import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { staffApi } from "../api/staff";

export default function PharmacyQueue() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role === "PHARMACY") {
            loadQueue();
        }
    }, [user]);

    const loadQueue = async () => {
        setLoading(true);
        try {
            const res = await staffApi.getPharmacyQueue();
            setQueue(res.data);
        } catch (err) {
            console.error("Failed to load pharmacy queue", err);
        }
        setLoading(false);
    };

    const handleDispense = async (id) => {
        if (window.confirm("Confirm dispense medicines to patient?")) {
            try {
                await staffApi.dispensePrescription(id, user.id);
                setQueue(queue.filter(q => q.id !== id));
            } catch (err) {
                alert("Failed to dispense prescription");
            }
        }
    };

    if (!user || user.role !== "PHARMACY") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="text-6xl mb-6 opacity-20">🚫</div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Access Restricted</h2>
                <p className="text-gray-500 max-w-xs">Please log in with pharmacist credentials to access the dispensary queue.</p>
                <button
                    onClick={() => navigate("/care-connect/login")}
                    className="mt-8 px-8 py-3 bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-100"
                >
                    Sign In as Staff
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 gap-6">
            <header className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dispensary Queue</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage pending prescriptions and medication distribution.</p>
                </div>
                <Link
                    to="/pharmacy/history"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all text-sm border border-gray-200"
                >
                    Order History
                    <span>→</span>
                </Link>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 bg-white border border-gray-100 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : queue.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4">✓</div>
                    <h2 className="text-lg font-bold text-gray-900">All Cleared</h2>
                    <p className="text-sm text-gray-500 max-w-xs mt-1">There are no pending prescriptions at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {queue.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
                            <div className="p-5 border-b border-gray-50 bg-gray-50/30 flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center font-bold text-lg">
                                        {item.consultation.appointment.patient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 leading-tight">
                                            {item.consultation.appointment.patient.name}
                                        </h3>
                                        <p className="text-xs font-medium text-gray-500 mt-0.5">
                                            {item.consultation.appointment.patient.sex?.charAt(0)} • {item.consultation.appointment.patient.age} Yrs
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded border border-gray-100">
                                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div className="p-5 flex-1">
                                <div className="mb-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Prescription</h4>
                                    <ul className="space-y-3">
                                        {item.items.map((med) => (
                                            <li key={med.id} className="flex justify-between items-start text-sm">
                                                <div>
                                                    <span className="font-semibold text-gray-800 block">{med.medicine.name}</span>
                                                    <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">{med.dosage}</span>
                                                </div>
                                                <span className="text-xs text-gray-500 font-medium whitespace-nowrap border-b border-dotted border-gray-300">
                                                    {med.duration}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="font-medium">Dr. {item.consultation.appointment.doctor.name}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDispense(item.id)}
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl font-semibold shadow-sm shadow-teal-100 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                                >
                                    <span>Dispense Medicines</span>
                                    <span>→</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

