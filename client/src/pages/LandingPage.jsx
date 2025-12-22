import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <nav className="w-full py-6 px-8 flex justify-between items-center max-w-7xl mx-auto border-b border-slate-200 bg-white">
                <div className="text-2xl font-bold tracking-tighter text-slate-800">
                    Care<span className="text-blue-600">Connect</span> <span className="text-slate-400 font-normal">| Staff Portal</span>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="text-sm text-slate-500 font-medium">Authorized Personnel Only</div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-6 py-20 lg:py-32 grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8 animate-in slide-in-from-left duration-700">
                    <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-tight">
                        Healthcare <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">
                            Simplified.
                        </span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-lg leading-relaxed">
                        Seamless appointment booking for patients and centralized operations for staff.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            onClick={() => navigate("/patient/book")}
                            className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-teal-200 hover:shadow-xl hover:translate-y-[-2px] transition-all flex items-center gap-3"
                        >
                            <span>Book Appointment</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                        <button
                            onClick={() => navigate("/care-connect/login")}
                            className="px-8 py-4 bg-white hover:bg-gray-50 text-slate-700 border-2 border-slate-200 rounded-xl font-bold text-lg transition-all flex items-center gap-3"
                        >
                            <span>Staff Login</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-12 border-t border-slate-200">
                        <div>
                            <div className="flex items-center gap-2 text-slate-800 font-semibold mb-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                System Status
                            </div>
                            <div className="text-sm text-slate-500">All Systems Operational</div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-slate-800 font-semibold mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-400">
                                    <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v12.59l1.95-2.1a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 111.1-1.02l1.95 2.1V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
                                </svg>
                                Latest Build
                            </div>
                            <div className="text-sm text-slate-500">v2.4.0 (Stable)</div>
                        </div>
                    </div>
                </div>

                {/* Secure Visual */}
                <div className="relative h-[600px] hidden lg:block animate-in zoom-in duration-1000">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10"></div>

                    <div className="relative z-10 w-full h-full glass-panel rounded-3xl border border-white/50 shadow-2xl p-8 backdrop-blur-xl bg-white/40">
                        {/* Abstract Dashboard Representation */}
                        <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                            <div className="h-12 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="p-8 flex-1 bg-slate-50/50 flex flex-col justify-center items-center text-center space-y-6">
                                <div className="w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-2 shadow-inner">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Protected Area</h3>
                                    <p className="text-slate-500 mt-2">Please log in with your credentials<br />to access patient records.</p>
                                </div>
                                <div className="w-full max-w-xs h-2 bg-slate-200 rounded-full overflow-hidden mt-8">
                                    <div className="h-full bg-blue-500 w-2/3 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
