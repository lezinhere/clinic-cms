import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { staffApi } from "../api/staff";

export default function PharmacyHistory() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (user && user.role === "PHARMACY") {
            const delay = setTimeout(() => {
                loadHistory();
            }, 300);
            return () => clearTimeout(delay);
        }
    }, [user, searchQuery]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const res = await staffApi.getPharmacyHistory(searchQuery);
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to load pharmacy history", err);
        }
        setLoading(false);
    };

    if (!user || user.role !== "PHARMACY") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="text-6xl mb-6 opacity-20">📜</div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">History Access Restricted</h2>
                <p className="text-gray-500 max-w-xs">Authentication is required to view the medical dispensation log.</p>
                <button
                    onClick={() => navigate("/care-connect/login")}
                    className="mt-8 px-8 py-3 bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-100"
                >
                    Staff Login
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <Link to="/pharmacy/queue" className="text-teal-600 font-black text-[10px] uppercase tracking-[0.2em] mb-2 block hover:translate-x-[-4px] transition-transform">
                        ← Back to Live Queue
                    </Link>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Dispensation Archive</h1>
                </div>
                <div className="w-full md:w-96 relative group">
                    <input
                        type="text"
                        placeholder="Search patient name or ID..."
                        className="w-full p-5 pl-14 bg-white border-2 border-slate-100 rounded-[2rem] focus:border-teal-500 outline-none text-sm font-bold shadow-xl shadow-slate-100/50 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl opacity-40 group-focus-within:opacity-100 transition-opacity">🔍</span>
                </div>
            </header>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 bg-white border border-slate-50 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : history.length === 0 ? (
                <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-20 text-center flex flex-col items-center">
                    <div className="text-4xl mb-6 opacity-20">📂</div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching records found</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {/* Desktop Headings */}
                    <div className="hidden lg:grid grid-cols-12 bg-slate-50/50 p-6 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <div className="col-span-2">Registry Date</div>
                        <div className="col-span-3">Patient Identity</div>
                        <div className="col-span-3">Ordering Physician</div>
                        <div className="col-span-4">Medications Fulfilled</div>
                    </div>

                    {history.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-100/30 border border-slate-50 hover:border-teal-100 transition-all group">
                            {/* Mobile View */}
                            <div className="lg:hidden space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center font-black italic text-lg shadow-sm border border-teal-50">
                                            {item.consultation.appointment.patient.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-0.5">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                            <h3 className="font-black text-gray-900 tracking-tight leading-none uppercase">
                                                {item.consultation.appointment.patient.name}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="bg-teal-50 text-teal-700 text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-teal-100 shadow-sm">
                                        Fulfilled
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Doctor</p>
                                        <p className="text-[10px] font-bold text-slate-600 uppercase">Dr. {item.consultation.appointment.doctor.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Patient ID</p>
                                        <p className="text-[10px] font-bold text-teal-600 uppercase tracking-tighter">PT-{item.consultation.appointment.patient.id.slice(-4)}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {item.items.map((drug, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-white text-slate-700 text-[10px] font-black rounded-lg border border-slate-100 flex items-center gap-2 shadow-sm">
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                                            {drug.medicine.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Desktop View */}
                            <div className="hidden lg:grid grid-cols-12 items-center gap-4">
                                <div className="col-span-2 text-slate-400 font-bold text-xs">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </div>
                                <div className="col-span-3">
                                    <div className="flex items-center gap-3">
                                        <span className="font-black text-slate-800 text-sm tracking-tight uppercase">{item.consultation.appointment.patient.name}</span>
                                        <span className="text-[10px] font-black text-slate-300 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase tracking-tighter">PT-{item.consultation.appointment.patient.id.slice(-4)}</span>
                                    </div>
                                </div>
                                <div className="col-span-3 text-slate-500 text-xs font-black uppercase tracking-widest">
                                    Dr. {item.consultation.appointment.doctor.name}
                                </div>
                                <div className="col-span-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        {item.items.map((drug, i) => (
                                            <span key={i} className="px-2.5 py-1 bg-teal-50 text-teal-700 text-[9px] font-black rounded-lg border border-teal-100 uppercase tracking-tight group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all">
                                                {drug.medicine.name}
                                            </span>
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

