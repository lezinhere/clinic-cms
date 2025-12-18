import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { staffApi } from "../api/staff";

export default function LabHistory() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (user && user.role === "LAB") {
            const delay = setTimeout(() => {
                loadHistory();
            }, 300);
            return () => clearTimeout(delay);
        }
    }, [user, searchQuery]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const res = await staffApi.getLabHistory(searchQuery);
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to load lab history", err);
        }
        setLoading(false);
    };

    if (!user || user.role !== "LAB") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 text-slate-400">
                <div className="text-6xl mb-6 opacity-20">📊</div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Vault Access Denied</h2>
                <p className="max-w-xs font-medium">Diagnostic archives are restricted to authorized laboratory personnel only.</p>
                <button
                    onClick={() => navigate("/care-connect/login")}
                    className="mt-8 px-8 py-3 bg-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-100"
                >
                    Authorized Login
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-12 pb-32">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16">
                <div>
                    <Link to="/lab/requests" className="text-purple-600 font-black text-[9px] uppercase tracking-[0.3em] mb-2 block hover:translate-x-[-2px] transition-transform">
                        ← Returns to Requests
                    </Link>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Diagnostic Archive</h1>
                </div>
                <div className="w-full lg:w-96 relative">
                    <input
                        type="text"
                        placeholder="Search Registry..."
                        className="w-full p-6 pl-16 bg-slate-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-[2.5rem] outline-none text-sm font-black shadow-inner transition-all tracking-tight"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="absolute left-7 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</span>
                </div>
            </header>

            {loading ? (
                <div className="space-y-6">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-24 bg-slate-50 rounded-[2.5rem] animate-pulse"></div>
                    ))}
                </div>
            ) : history.length === 0 ? (
                <div className="bg-white rounded-[4rem] border-2 border-dashed border-slate-100 p-24 text-center">
                    <div className="text-4xl mb-6 opacity-10 italic">EMPTY_VAULT</div>
                    <p className="text-slate-300 font-black uppercase tracking-widest text-[9px]">No historical data found</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {/* Header Row */}
                    <div className="hidden md:grid grid-cols-12 bg-slate-50/50 p-8 rounded-[2.5rem] text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        <div className="col-span-2">Archive Date</div>
                        <div className="col-span-3">Diagnostic Type</div>
                        <div className="col-span-3">Patient Profile</div>
                        <div className="col-span-4">Registry Report</div>
                    </div>

                    {history.map((item) => (
                        <div key={item.id} className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-slate-100/30 border border-slate-50 hover:border-purple-200 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-[4rem] -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center pt-6 pl-6">
                                <span className="text-purple-600 font-black text-[9px] uppercase tracking-tighter rotate-12">Closed</span>
                            </div>

                            {/* Mobile View */}
                            <div className="md:hidden space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                        <h3 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tighter">{item.testName}</h3>
                                    </div>
                                    <div className="bg-purple-600 text-white text-[8px] px-3 py-1.5 rounded-full font-black uppercase tracking-[0.2em] shadow-lg shadow-purple-100">
                                        Verified
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 pt-6 border-t border-slate-50">
                                    <div>
                                        <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest mb-1.5">Selected Patient</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm text-slate-900 font-black uppercase">{item.consultation.appointment.patient.name}</p>
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-md text-[8px] font-black uppercase tracking-tighter">PT-{item.consultation.appointment.patient.id.slice(-4)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest mb-1.5">Registry Narrative</p>
                                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-50 text-[10px] text-slate-500 font-medium italic leading-relaxed">
                                            {item.resultReport}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop View */}
                            <div className="hidden md:grid grid-cols-12 items-center gap-6">
                                <div className="col-span-2 text-slate-400 font-black text-[10px] tracking-tight">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </div>
                                <div className="col-span-3 font-black text-slate-800 text-sm tracking-widest uppercase">
                                    {item.testName}
                                </div>
                                <div className="col-span-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">{item.consultation.appointment.patient.name}</span>
                                        <span className="text-[8px] font-black text-slate-300">#RX-{item.id.slice(-4)}</span>
                                    </div>
                                </div>
                                <div className="col-span-4">
                                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50 text-[10px] text-slate-400 font-medium italic group-hover:text-purple-600 group-hover:bg-purple-50 group-hover:border-purple-100 transition-all truncate pr-10">
                                        {item.resultReport}
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

