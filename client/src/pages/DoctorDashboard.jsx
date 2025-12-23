import React, { useEffect, useState } from "react";
// Force Vercel Rebuild Attempt 3
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
    const [walkInModal, setWalkInModal] = useState(false);
    const [walkInForm, setWalkInForm] = useState({ name: "", age: "", sex: "", phone: "" });

    const [walkInLoading, setWalkInLoading] = useState(false);
    const [confirmingId, setConfirmingId] = useState(null); // Track which appointment is being cancelled

    useEffect(() => {
        if (user && user.role === "DOCTOR") {
            setLoading(true);
            Promise.all([
                doctorApi.getAppointments(user.id),
                doctorApi.getHistory(user.id, searchQuery)
            ]).then(([upcomingRes, pastRes]) => {
                // Filter for TODAY ONLY
                const todayStr = new Date().toDateString();
                const todayApts = upcomingRes.data.filter(apt => new Date(apt.date).toDateString() === todayStr);

                setAppointments(todayApts);
                setHistory(pastRes.data);
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [user, searchQuery]);

    const refreshData = () => {
        if (user) {
            doctorApi.getAppointments(user.id).then(res => {
                const todayStr = new Date().toDateString();
                const todayApts = res.data.filter(apt => new Date(apt.date).toDateString() === todayStr);
                setAppointments(todayApts);
            });
            doctorApi.getHistory(user.id, searchQuery).then(res => setHistory(res.data));
        }
    };

    const handleWalkInSubmit = async (e) => {
        e.preventDefault();
        setWalkInLoading(true);
        try {
            const res = await doctorApi.instantBook({ ...walkInForm, doctorId: user.id });
            if (res.data.success) {
                setWalkInModal(false);
                setWalkInForm({ name: "", age: "", sex: "", phone: "" });
                alert(`Patient Booked! Token: ${res.data.appointment.tokenNumber}`);
                refreshData();
            } else {
                alert(res.data.error || "Booking Failed");
            }
        } catch (err) {
            alert("Booking Failed");
        }
        setWalkInLoading(false);
    };

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
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded">v2.1</span></h1>
                    <p className="text-gray-500">Welcome back, Dr. {user.name}</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={refreshData}
                        className={`p-3 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all ${loading ? "animate-spin text-blue-600" : ""}`}
                        title="Refresh Data"
                    >
                        ↻ Sync Data
                    </button>
                    <button
                        onClick={() => setWalkInModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-blue-200 font-bold transition-all active:scale-95 flex items-center gap-2"
                    >
                        <span>+</span> Add Patient
                    </button>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center">
                        <span className="text-gray-500 text-sm">Today:</span>
                        <span className="ml-2 font-bold text-blue-600 text-xl">{todayCount}</span>
                    </div>
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
                                                {(apt.patientName || apt.patient?.name)?.charAt(0) || 'P'}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">{apt.patientName || apt.patient?.name}</h3>
                                                <div className="text-sm text-gray-500 flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                                    <span>{apt.patientAge || apt.patient?.age} yrs</span>
                                                    <span>{apt.patientGender || apt.patient?.sex}</span>
                                                    {apt.tokenNumber && (
                                                        <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded text-xs font-bold">
                                                            Token #{apt.tokenNumber}
                                                        </span>
                                                    )}
                                                    <span className="font-semibold text-blue-600 block sm:inline">
                                                        {apt.slotTime || new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>

                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 w-full sm:w-auto">

                                            {confirmingId === apt.id ? (
                                                <button
                                                    onClick={() => {
                                                        doctorApi.cancelAppointment(apt.id)
                                                            .then(() => {
                                                                refreshData();
                                                                setConfirmingId(null);
                                                            })
                                                            .catch(err => alert("Failed to cancel: " + (err.response?.data?.error || err.message)));
                                                    }}
                                                    className="px-4 py-3 bg-red-600 text-white rounded-xl font-bold transition-all animate-pulse text-sm"
                                                >
                                                    Confirm?
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmingId(apt.id)}
                                                    className="px-4 py-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            <Link
                                                to={`/doctor/consult/${apt.id}`}
                                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 text-center shadow-lg shadow-blue-100"
                                            >
                                                Start Consult
                                            </Link>
                                        </div>
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
                                            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                {(apt.patientName || apt.patient.name)[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{apt.patientName || apt.patient.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {apt.patientAge || apt.patient.age} yrs • {apt.patientGender || apt.patient.sex} • <span className="font-mono bg-teal-50 text-teal-700 px-2 rounded">{apt.tokenNumber ? `Token #${apt.tokenNumber}` : 'No Token'}</span>
                                                </p>
                                                <div className="text-blue-600 font-bold text-sm mt-1">
                                                    {apt.slotTime || "Walk-In"}
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
            )
            }
            {/* Walk-in Modal */}
            {
                walkInModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl border border-white/20">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Add Walk-in Patient</h2>
                                <button onClick={() => setWalkInModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
                            </div>
                            <form onSubmit={handleWalkInSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Patient Name</label>
                                    <input
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                        value={walkInForm.name}
                                        onChange={e => setWalkInForm({ ...walkInForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Age</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                            value={walkInForm.age}
                                            onChange={e => setWalkInForm({ ...walkInForm, age: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Sex</label>
                                        <select
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                            value={walkInForm.sex}
                                            onChange={e => setWalkInForm({ ...walkInForm, sex: e.target.value })}
                                        >
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Phone</label>
                                    <input
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                        value={walkInForm.phone}
                                        onChange={e => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={walkInLoading}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {walkInLoading ? "Registering..." : "Book Appointment"}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
