import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
    const navigate = useNavigate();

    const handlePatientLogin = () => {
        navigate("/patient/book");
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="w-full py-6 px-8 flex justify-between items-center max-w-7xl mx-auto">
                <div className="text-2xl font-bold tracking-tighter text-teal-800">
                    Care<span className="text-teal-500">Connect</span>
                </div>
                <div className="flex gap-6 items-center">
                    <button
                        onClick={() => navigate("/care-connect/login")}
                        className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        Provider Login
                    </button>
                    <button
                        onClick={() => navigate("/patient/login")}
                        className="px-5 py-2 rounded-full border border-teal-100 text-teal-700 font-medium hover:bg-teal-50 transition-colors"
                    >
                        Login
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20 grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                    <div className="inline-block px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-semibold tracking-wide">
                        🏥 #1 Trusted Healthcare Platform
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                        Your Health, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">
                            Reimagined.
                        </span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-lg leading-relaxed">
                        Book appointments with top specialists, track your medical history, and manage your family's health. All in one place.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            onClick={handlePatientLogin}
                            className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-teal-200 hover:shadow-2xl hover:scale-105 transition-all"
                        >
                            Book Appointment Now
                        </button>
                        <button className="px-8 py-4 bg-white border border-gray-100 text-gray-600 hover:text-gray-900 hover:border-gray-300 rounded-2xl font-bold text-lg transition-all">
                            Learn More
                        </button>
                    </div>

                    <div className="flex items-center gap-8 pt-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">10k+</div>
                            <div className="text-sm text-gray-500">Patients Served</div>
                        </div>
                        <div className="w-px h-10 bg-gray-200"></div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">50+</div>
                            <div className="text-sm text-gray-500">Specialists</div>
                        </div>
                        <div className="w-px h-10 bg-gray-200"></div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">24/7</div>
                            <div className="text-sm text-gray-500">Support</div>
                        </div>
                    </div>
                </div>

                {/* Hero Visual */}
                <div className="relative h-[600px] hidden lg:block">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-50 rounded-full blur-3xl opacity-50 -z-10 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-50 -z-10"></div>

                    <div className="relative z-10 w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-100 shadow-2xl p-6 rotate-2 hover:rotate-0 transition-transform duration-700 ease-out">
                        <div className="h-full w-full bg-white rounded-2xl overflow-hidden relative">
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6">
                                <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center text-5xl mb-4">
                                    🗓️
                                </div>
                                <h3 className="text-3xl font-bold text-gray-800">Booking Confirmed</h3>
                                <p className="text-gray-500">Dr. Sarah Smith • Cardiologist</p>
                                <hr className="w-1/2 border-gray-100" />
                                <div className="flex gap-4 w-full">
                                    <div className="flex-1 bg-gray-50 p-4 rounded-xl">
                                        <div className="text-xs text-gray-400 uppercase font-bold">Date</div>
                                        <div className="font-semibold text-gray-700">Oct 24</div>
                                    </div>
                                    <div className="flex-1 bg-gray-50 p-4 rounded-xl">
                                        <div className="text-xs text-gray-400 uppercase font-bold">Time</div>
                                        <div className="font-semibold text-gray-700">10:00 AM</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
