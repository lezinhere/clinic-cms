import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { staffApi } from "../api/staff";

export default function LabRequests() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role === "LAB") {
            loadQueue();
        }
    }, [user]);

    const loadQueue = async () => {
        setLoading(true);
        try {
            const res = await staffApi.getLabRequests();
            setQueue(res.data);
        } catch (err) {
            console.error("Failed to load lab queue", err);
        }
        setLoading(false);
    };

    const handleComplete = async (id) => {
        // Simulate File Upload
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "application/pdf";

        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                setLoading(true);
                try {
                    // In a real app, this would be a multipart/form-data upload
                    await staffApi.completeLabRequest(id, {
                        result: `PDF Report: ${file.name}`,
                        staffId: user.id
                    });
                    setQueue(queue.filter(q => q.id !== id));
                } catch (err) {
                    alert("Failed to upload lab report");
                }
                setLoading(false);
            }
        };
        fileInput.click();
    };

    if (!user || user.role !== "LAB") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 text-slate-400">
                <div className="text-6xl mb-6 opacity-20">🧪</div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Technician Portal Restricted</h2>
                <p className="max-w-xs font-medium">Please authenticate with laboratory credentials to view diagnostic requests.</p>
                <button
                    onClick={() => navigate("/care-connect/login")}
                    className="mt-8 px-8 py-3 bg-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-100"
                >
                    Sign In to Portal
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-12 pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Clinical Diagnostics</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Active Laboratory Worklist</p>
                </div>
                <Link
                    to="/lab/history"
                    className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-purple-600 font-black text-xs uppercase tracking-widest hover:border-purple-600 transition-all shadow-sm"
                >
                    Diagnostic History
                </Link>
            </header>

            {loading ? (
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-slate-50 border border-slate-100 rounded-[2.5rem] animate-pulse"></div>
                    ))}
                </div>
            ) : queue.length === 0 ? (
                <div className="bg-white rounded-[4rem] border-2 border-dashed border-slate-100 p-24 text-center">
                    <div className="text-5xl mb-6 opacity-20 italic">📂</div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Worklist Clear</h2>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto">All diagnostic tasks have been fulfilled. The clinical engine is running smooth.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {queue.map((item) => (
                        <div key={item.id} className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-slate-100/50 border border-slate-50 flex flex-col md:flex-row items-center justify-between gap-10 group transition-all hover:scale-[1.01]">
                            <div className="w-full">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-purple-50 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                        🧪
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-purple-600 transition-colors uppercase">{item.testName}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-black text-amber-500 bg-amber-50 px-3 py-1 rounded-lg uppercase tracking-widest border border-amber-100">Pending Analytics</span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Received {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-[2rem] border border-slate-50 group-hover:bg-purple-50/30 group-hover:border-purple-100 transition-all">
                                    <div className="text-lg">🆔</div>
                                    <div>
                                        <p className="text-slate-900 font-black tracking-tight">{item.consultation.appointment.patient.name}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                            {item.consultation.appointment.patient.sex} • {item.consultation.appointment.patient.age}Y • PT-{item.consultation.appointment.patient.id.slice(-4)}
                                        </p>
                                    </div>
                                    <div className="ml-auto text-right border-l border-slate-200 pl-4 hidden sm:block">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Clinic Origin</p>
                                        <p className="text-[10px] font-black text-slate-600">DR. {item.consultation.appointment.doctor.name.toUpperCase()}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleComplete(item.id)}
                                className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-10 py-6 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-purple-100 transition-all active:scale-95 flex items-center justify-center gap-3 whitespace-nowrap"
                            >
                                <span>Upload Registry</span>
                                <span className="text-lg">📄</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

