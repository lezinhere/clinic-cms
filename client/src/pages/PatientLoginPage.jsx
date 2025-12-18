import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth";

export default function PatientLoginPage() {
    const { loginDirect } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Phone, 2: OTP
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError("");

        if (!/^\d{10}$/.test(phone)) {
            setError("Please enter a valid 10-digit phone number");
            return;
        }

        setLoading(true);
        try {
            const res = await authApi.sendOtp(phone);
            if (res.data.success) {
                setStep(2);
            } else {
                setError(res.data.error || "Failed to send verification code");
            }
        } catch (err) {
            setError("Error sending OTP");
        }
        setLoading(false);
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await authApi.verifyOtp(phone, otp);
            if (res.data.success && res.data.user) {
                loginDirect(res.data.user);
                navigate("/patient/history");
            } else {
                setError(res.data.error || "Invalid verification code");
            }
        } catch (err) {
            setError(err.response?.data?.error || "Verification failed");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl border border-gray-100">
                <div className="text-center mb-10">
                    <div className="text-4xl mb-4">🏥</div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Patient Portal</h1>
                    <p className="text-gray-500 mt-2">
                        {step === 1 ? "Secure access to your medical records" : "Identity Verification"}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center font-medium">
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Registered Phone Number</label>
                            <input
                                type="tel"
                                placeholder="9876543210"
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 text-xl text-center tracking-widest focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition-all placeholder:text-gray-300"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-200 transition-all active:scale-95 flex items-center justify-center"
                        >
                            {loading ? "Verifying..." : "Send Verification Code"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div className="text-center mb-6">
                            <p className="text-sm text-gray-600">Enter the 6-digit code sent to</p>
                            <p className="font-bold text-gray-900">XXXX-XX-{phone.slice(-4)}</p>
                        </div>

                        <div>
                            <input
                                type="text"
                                maxLength={6}
                                placeholder="000000"
                                autoFocus
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 text-3xl text-center tracking-[0.5em] focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition-all placeholder:text-gray-200"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-200 transition-all active:scale-95 flex items-center justify-center"
                        >
                            {loading ? "Verifying..." : "Verify & Access History"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors"
                        >
                            Wrong number? Go back
                        </button>
                    </form>
                )}

                <div className="mt-8 pt-8 border-t border-gray-50 text-center flex flex-col gap-4">
                    <button
                        onClick={() => navigate("/")}
                        className="text-gray-400 hover:text-gray-600 transition-colors text-xs font-medium"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
