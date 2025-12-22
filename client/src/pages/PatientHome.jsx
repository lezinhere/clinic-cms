import React from "react";
import { useNavigate } from "react-router-dom";

export default function PatientHome() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-12">
                <div className="space-y-4">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Welcome, Patient
                    </h1>
                    <p className="text-slate-500 text-lg">
                        What would you like to do today?
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => navigate("/patient/book")}
                        className="w-full py-6 bg-teal-600 hover:bg-teal-700 text-white rounded-3xl font-bold text-xl shadow-xl shadow-teal-200 hover:shadow-2xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 group"
                    >
                        <div className="p-2 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </div>
                        Book New Appointment
                    </button>

                    <button
                        onClick={() => navigate("/patient/login")}
                        className="w-full py-6 bg-white hover:bg-white text-slate-600 border-2 border-slate-200 hover:border-teal-200 rounded-3xl font-bold text-xl shadow-sm hover:shadow-lg transition-all flex items-center justify-center gap-3 group"
                    >
                        <div className="p-2 bg-slate-100 rounded-full group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                            </svg>
                        </div>
                        Check Status
                    </button>
                </div>
            </div>
        </div>
    );
}
