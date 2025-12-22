import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth";

export default function ProviderLoginPage() {
    const { loginWithPasscode } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Role, 2: Name, 3: Passcode
    const [selectedRole, setSelectedRole] = useState("");
    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [passcode, setPasscode] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetchingStaff, setFetchingStaff] = useState(false);

    const handleRoleSelect = async (role) => {
        setSelectedRole(role);
        setError("");
        setFetchingStaff(true);
        try {
            const res = await authApi.getStaffByRole(role);
            setStaffList(res.data);
            setStep(2);
        } catch (err) {
            setError("Failed to fetch staff list");
        }
        setFetchingStaff(false);
    };

    const handleStaffSelect = (staff) => {
        setSelectedStaff(staff);
        setStep(3);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const res = await loginWithPasscode(selectedStaff.id, passcode);

        if (res.success) {
            if (selectedRole === "ADMIN") navigate("/admin/dashboard");
            else if (selectedRole === "DOCTOR") navigate("/doctor/dashboard");
            else if (selectedRole === "PHARMACY") navigate("/pharmacy/queue");
            else if (selectedRole === "LAB") navigate("/lab/requests");
            else navigate("/care-connect");
        } else {
            setError(res.error || "Login failed");
        }
        setLoading(false);
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white text-center mb-8">Select Your Department</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { role: "ADMIN", label: "Administration", icon: "🏢" },
                                { role: "DOCTOR", label: "Doctor Station", icon: "👨‍⚕️" },
                                { role: "PHARMACY", label: "Pharmacy", icon: "💊" },
                                { role: "LAB", label: "Laboratory", icon: "🧪" }
                            ].map(item => (
                                <button
                                    key={item.role}
                                    onClick={() => handleRoleSelect(item.role)}
                                    className="w-full p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center gap-6 transition-all group text-left"
                                >
                                    <span className="text-3xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                    <span className="text-xl font-bold text-white">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Select Your Name</h2>
                            <button onClick={() => setStep(1)} className="text-xs text-indigo-400 hover:underline">Back</button>
                        </div>
                        {fetchingStaff ? (
                            <div className="text-center py-8 text-slate-400">Loading staff database...</div>
                        ) : staffList.length === 0 ? (
                            <div className="text-center py-8 text-red-400">No active staff found for this role.</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {staffList.map(staff => (
                                    <button
                                        key={staff.id}
                                        onClick={() => handleStaffSelect(staff)}
                                        className="w-full p-4 bg-white/5 hover:bg-indigo-600/20 border border-white/10 rounded-2xl text-left text-white font-medium transition-all"
                                    >
                                        {staff.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 3:
                return (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center justify-between mb-6 text-left">
                            <div>
                                <h2 className="text-xl font-bold text-white leading-tight">{selectedStaff.name}</h2>
                                <p className="text-indigo-400 text-sm uppercase font-bold tracking-tighter">{selectedRole}</p>
                            </div>
                            <button type="button" onClick={() => setStep(2)} className="text-xs text-indigo-400 hover:underline">Change Staff</button>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-200 text-sm rounded-xl text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Enter PIN</label>
                            <input
                                type="password"
                                placeholder="••••"
                                autoFocus
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-3xl text-center tracking-[1em] focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                                required
                            />
                            <p className="text-[10px] text-slate-500 mt-2 px-1 text-center font-medium">Use your 4-digit security PIN</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center mt-4"
                        >
                            {loading ? "Authenticating..." : "Enter Station"}
                        </button>
                    </form>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
            <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl">
                <div className="text-center mb-10">
                    <div className="h-16 w-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg shadow-indigo-500/50">
                        CC
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">CareConnect Pro</h1>
                </div>

                {renderStep()}

                <div className="mt-8 pt-8 border-t border-white/5 text-center text-slate-500 text-xs">
                    Authorized Personnel Only
                </div>
            </div>
        </div>
    );
}
