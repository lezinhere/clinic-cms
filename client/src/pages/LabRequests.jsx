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
                // Check file size (limit to 2MB for potential DB/payload limits)
                if (file.size > 2 * 1024 * 1024) {
                    alert("File is too large (Max 2MB). Please upload a smaller optimized PDF.");
                    return;
                }

                setLoading(true);
                const reader = new FileReader();
                reader.onload = async () => {
                    const base64Data = reader.result; // This is the DataURL
                    try {
                        await staffApi.completeLabRequest(id, {
                            result: `PDF Report: ${base64Data}`, // Save the actual DataURL
                            staffId: user.id
                        });
                        setQueue(queue.filter(q => q.id !== id));
                    } catch (err) {
                        alert("Failed to upload lab report: " + (err.response?.data?.error || err.message));
                    }
                    setLoading(false);
                };
                reader.readAsDataURL(file);
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
        <div className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 gap-6">
            <header className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Clinical Diagnostics</h1>
                    <p className="text-sm text-gray-500 mt-1">Active Laboratory Worklist</p>
                </div>
                <Link
                    to="/lab/history"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-purple-700 font-semibold rounded-xl hover:bg-gray-100 transition-all text-sm border border-gray-200"
                >
                    Diagnostic History
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
                    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4">📂</div>
                    <h2 className="text-lg font-bold text-gray-900">Worklist Clear</h2>
                    <p className="text-sm text-gray-500 max-w-xs mt-1">All diagnostic tasks have been fulfilled.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {queue.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
                            <div className="p-5 border-b border-gray-50 bg-gray-50/30 flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center font-bold text-lg">
                                        🧪
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 leading-tight">
                                            {item.testName}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium border border-amber-100">
                                                Pending
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded border border-gray-100">
                                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div className="p-5 flex-1">
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Patient</h4>
                                        <p className="font-bold text-gray-900">{item.consultation.appointment.patient.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {item.consultation.appointment.patient.sex} • {item.consultation.appointment.patient.age}Y • PT-{item.consultation.appointment.patient.id.slice(-4)}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Clinic Origin</h4>
                                        <p className="text-sm font-medium text-gray-700">Dr. {item.consultation.appointment.doctor.name}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                                <button
                                    onClick={() => handleComplete(item.id)}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-semibold shadow-sm shadow-purple-100 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                                >
                                    <span>Upload Report</span>
                                    <span>📄</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

