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
        <div className="max-w-6xl mx-auto p-6 md:p-10 pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Dispensary Queue</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage pending prescriptions and medication distribution.</p>
                </div>
                <Link
                    to="/pharmacy/history"
                    className="group flex items-center gap-3 px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-600 font-bold hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm"
                >
                    Order History
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-white border border-gray-100 rounded-3xl animate-pulse shadow-sm"></div>
                    ))}
                </div>
            ) : queue.length === 0 ? (
                <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-20 text-center flex flex-col items-center">
                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner italic">✓</div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Queue is Clear</h2>
                    <p className="text-gray-400 font-medium max-w-sm">There are no pending prescriptions at the moment. Excellent work!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {queue.map((item) => (
                        <div key={item.id} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100/50 border border-slate-50 overflow-hidden transform transition-all hover:scale-[1.01]">
                            <div className="p-8">
                                <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center text-xl font-black italic shadow-sm border border-teal-100">
                                                {item.consultation.appointment.patient.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                                    {item.consultation.appointment.patient.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                                                        {item.consultation.appointment.patient.sex} • {item.consultation.appointment.patient.age}Y
                                                    </span>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                                                        PT-{item.consultation.appointment.patient.id.slice(-4)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-slate-500 bg-slate-50/50 p-3 rounded-2xl border border-slate-50">
                                            <span className="text-lg">👨‍⚕️</span>
                                            <p className="text-sm font-bold">
                                                Prescribed by <span className="text-slate-900">Dr. {item.consultation.appointment.doctor.name}</span>
                                            </p>
                                            <span className="text-slate-300 ml-auto text-xs font-black uppercase tracking-widest">
                                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDispense(item.id)}
                                        className="w-full lg:w-auto bg-teal-600 hover:bg-teal-700 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-teal-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        <span>Mark Dispensed</span>
                                        <span className="text-xl">📦</span>
                                    </button>
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-50">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Medication List</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {item.items.map((med, idx) => (
                                            <div key={med.id} className="flex items-center justify-between p-5 bg-blue-50/30 rounded-3xl border border-blue-50 group hover:border-blue-200 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-8 w-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-[10px] italic shadow-lg shadow-blue-100">Rx</div>
                                                    <div>
                                                        <span className="block font-black text-slate-800 text-sm">{med.medicine.name}</span>
                                                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{med.dosage}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="px-3 py-1 bg-white rounded-full text-[10px] font-black text-slate-400 border border-slate-100 uppercase tracking-tighter">{med.duration}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

