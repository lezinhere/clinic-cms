import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doctorApi } from "../api/doctor";

export default function DoctorDashboard() {
    const { user } = useAuth();
    const [tab, setTab] = useState('UPCOMING');
    const [appointments, setAppointments] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (user && user.role === "DOCTOR") {
            setLoading(true);
            Promise.all([
                doctorApi.getAppointments(user.id),
                doctorApi.getHistory(user.id, searchQuery)
            ]).then(([upcomingRes, pastRes]) => {
                setAppointments(upcomingRes.data);
                setHistory(pastRes.data);
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [user, searchQuery]);

    const todayCount = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        const today = new Date();
        return aptDate.toDateString() === today.toDateString();
    }).length;

    if (!user) return <div className="p-8 text-center text-gray-500">Please log in as a Doctor.</div>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500">Welcome back, Dr. {user.name}</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                    <span className="text-gray-500 text-sm">Today&apos;s Appointments:</span>
                    <span className="ml-2 font-bold text-blue-600 text-xl">{todayCount}</span>
                </div>
            </header>

            {/* Tabs & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-100">
                <div className="flex gap-4">
                    <button
                        onClick={() => setTab('UPCOMING')}
                        className={`pb-2 px-1 font-medium text-sm transition-colors ${tab === 'UPCOMING' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Upcoming Schedule
                    </button>
                    <button
                        onClick={() => setTab('HISTORY')}
                        className={`pb-2 px-1 font-medium text-sm transition-colors ${tab === 'HISTORY' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Consultation History
                    </button>
                </div>

                {tab === 'HISTORY' && (
                    <div className="pb-3 w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search Name or User ID..."
                            className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {loading ? (
                <div className="text-gray-500 animate-pulse text-center py-10">Loading clinical data...</div>
            ) : (
                <div className="space-y-4">
                    {/* UPCOMING VIEW */}
                    {tab === 'UPCOMING' && (
                        appointments.length === 0 ? (
                            <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
                                <p className="text-gray-400 text-lg">No appointments scheduled for today.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {appointments.map((apt) => (
                                    <div key={apt.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xl">
                                                {apt.patient?.name?.charAt(0) || 'P'}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">{apt.patient?.name}</h3>
                                                <div className="text-sm text-gray-500 flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                                    <span>{apt.patient?.age} yrs</span>
                                                    <span>{apt.patient?.sex}</span>
                                                    <span className="font-semibold text-blue-600">
                                                        {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/doctor/consult/${apt.id}`}
                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 text-center shadow-lg shadow-blue-100"
                                        >
                                            Start Consult
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* HISTORY VIEW */}
                    {tab === 'HISTORY' && (
                        <div className="grid gap-4">
                            {history.map((apt) => (
                                <div key={apt.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center font-bold">
                                                {apt.patient?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">{apt.patient?.name}</h4>
                                                <p className="text-xs text-gray-400">{new Date(apt.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 px-4 truncate text-sm text-gray-600 italic">
                                            {apt.consultation?.diagnosis || "No diagnosis recorded"}
                                        </div>
                                        <Link
                                            to={`/patient/history?patientId=${apt.patient?.id}`}
                                            className="text-blue-600 font-bold text-sm hover:underline whitespace-nowrap"
                                        >
                                            View Details →
                                        </Link>
                                    </div>
                                </div>
                            ))}

                            {history.length === 0 && (
                                <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100 italic text-gray-400">
                                    No past consultation records found.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
