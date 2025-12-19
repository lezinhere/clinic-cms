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
        <div className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 gap-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <Link to="/lab/requests" className="text-purple-600 font-semibold text-xs mb-2 block hover:underline flex items-center gap-1">
                        <span>←</span> Back to Requests
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Diagnostic Archive</h1>
                </div>
                <div className="w-full md:w-80 relative">
                    <input
                        type="text"
                        placeholder="Search registry..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-sm font-medium transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
                </div>
            </header>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-16 bg-white border border-gray-100 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : history.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center flex flex-col items-center">
                    <div className="text-3xl mb-4 opacity-30">📊</div>
                    <p className="text-gray-500 font-medium text-sm">No historical data found</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Header Row */}
                    <div className="hidden md:grid grid-cols-12 bg-gray-50/50 p-4 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="col-span-2 pl-2">Date</div>
                        <div className="col-span-3">Test Name</div>
                        <div className="col-span-3">Patient</div>
                        <div className="col-span-4">Report Summary</div>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {history.map((item) => (
                            <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors group">
                                {/* Mobile View */}
                                <div className="md:hidden space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium mb-1">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                            <h3 className="font-bold text-gray-900">
                                                {item.testName}
                                            </h3>
                                        </div>
                                        <span className="bg-purple-50 text-purple-700 text-[10px] px-2 py-1 rounded-md font-bold border border-purple-100">
                                            Verified
                                        </span>
                                    </div>

                                    <div className="text-xs text-gray-600">
                                        <span className="text-gray-400">Patient:</span> {item.consultation.appointment.patient.name}
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs text-gray-600">
                                        <span className="font-semibold text-gray-500 display-block mb-1">Result:</span>
                                        <div className="truncate">{item.resultReport}</div>
                                    </div>
                                </div>

                                {/* Desktop View */}
                                <div className="hidden md:grid grid-cols-12 items-center gap-4">
                                    <div className="col-span-2 text-sm text-gray-600 pl-2">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="col-span-3 font-semibold text-gray-900 text-sm">
                                        {item.testName}
                                    </div>
                                    <div className="col-span-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900 text-sm">{item.consultation.appointment.patient.name}</span>
                                            <span className="text-xs text-gray-400">#RX-{item.id.slice(-4)}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-4">
                                        <div className="text-xs text-gray-500 font-medium truncate bg-gray-50 px-3 py-1.5 rounded-lg border border-transparent group-hover:border-purple-100 group-hover:bg-purple-50 group-hover:text-purple-700 transition-all cursor-default">
                                            {item.resultReport}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

