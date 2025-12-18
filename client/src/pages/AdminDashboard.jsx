import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminApi } from "../api/admin";

export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        role: "DOCTOR",
        specialization: "",
        passcode: "",
        displayId: ""
    });
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (!user || user.role !== "ADMIN") {
            navigate("/care-connect/login");
            return;
        }
        loadStaff();
    }, [user, navigate]);

    async function loadStaff() {
        setLoading(true);
        try {
            const res = await adminApi.getAllStaff();
            setStaff(res.data);
        } catch (err) {
            console.error("Failed to load staff", err);
        }
        setLoading(false);
    }

    const resetForm = () => {
        setFormData({ name: "", role: "DOCTOR", specialization: "", passcode: "", displayId: "" });
        setEditingStaff(null);
        setFormError("");
    };

    const openCreateModal = () => {
        resetForm();
        setModalOpen(true);
    };

    const openEditModal = (s) => {
        setEditingStaff(s);
        setFormData({
            name: s.name,
            role: s.role,
            specialization: s.specialization || "",
            passcode: s.passcode || "",
            displayId: s.displayId || ""
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        try {
            if (editingStaff) {
                const res = await adminApi.updateStaffMember(editingStaff.id, formData);
                if (res.data.success) {
                    setModalOpen(false);
                    loadStaff();
                } else {
                    setFormError(res.data.error || "Update failed");
                }
            } else {
                const res = await adminApi.createStaffMember(formData);
                if (res.data.success) {
                    setModalOpen(false);
                    loadStaff();
                } else {
                    setFormError(res.data.error || "Creation failed");
                }
            }
        } catch (err) {
            setFormError(err.response?.data?.error || "Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to remove this staff member?")) {
            try {
                const res = await adminApi.deleteStaffMember(id);
                if (res.data.success) loadStaff();
            } catch (err) {
                alert("Failed to delete staff member");
            }
        }
    };

    if (!user || user.role !== "ADMIN") return null;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Admin Command Center</h1>
                    <p className="text-gray-500">Manage clinic staff and system access</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 active:scale-95"
                >
                    <span className="text-xl">+</span> Add New Staff
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Staff", value: staff.length, color: "blue" },
                    { label: "Doctors", value: staff.filter(s => s.role === 'DOCTOR').length, color: "green" },
                    { label: "Pharmacy", value: staff.filter(s => s.role === 'PHARMACY').length, color: "orange" },
                    { label: "Lab", value: staff.filter(s => s.role === 'LAB').length, color: "purple" },
                ].map((stat, i) => (
                    <div key={i} className={`bg-white p-6 rounded-2xl border-l-4 border-${stat.color}-500 shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Staff Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-800">Staff Directory</h2>
                    <span className="text-xs font-medium text-gray-400 italic">Syncing with MongoDB Atlas</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/80 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b">
                            <tr>
                                <th className="px-6 py-4">Display ID</th>
                                <th className="px-6 py-4">Name & Specialty</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">Security PIN</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading && staff.length === 0 ? (
                                <tr><td colSpan={5} className="p-12 text-center text-gray-300 animate-pulse">Syncing staff data...</td></tr>
                            ) : staff.map((s) => (
                                <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-400 bg-indigo-50/30 group-hover:bg-indigo-50 transition-colors">{s.displayId || 'PID-GEN'}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800">{s.name}</div>
                                        {s.specialization && <div className="text-xs text-gray-400 font-medium">{s.specialization}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${s.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                                            s.role === 'DOCTOR' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {s.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-gray-300 tracking-widest group-hover:text-gray-500 transition-colors">{s.passcode || '****'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-3 translate-x-2 group-hover:translate-x-0 transition-transform">
                                            <button onClick={() => openEditModal(s)} className="p-2 text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all">Edit</button>
                                            {s.displayId !== 'ADMIN-001' && (
                                                <button onClick={() => handleDelete(s.id)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">Delete</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl border border-white/20">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {editingStaff ? "Update Credentials" : "New Onboarding"}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Identity Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Dr. Jordan Smith"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Station</label>
                                        <select
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700"
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="DOCTOR">Doctor</option>
                                            <option value="PHARMACY">Pharmacy</option>
                                            <option value="LAB">Laboratory</option>
                                            <option value="ADMIN">Administrator</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">System Handle</label>
                                        <input
                                            type="text"
                                            placeholder="DOC-042"
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                            value={formData.displayId}
                                            onChange={e => setFormData({ ...formData, displayId: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {formData.role === 'DOCTOR' && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Core Specialization</label>
                                        <input
                                            type="text"
                                            placeholder="Cardiology, ENT, etc."
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            value={formData.specialization}
                                            onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Security PIN (4 digits)</label>
                                    <input
                                        type="text"
                                        maxLength={4}
                                        required
                                        placeholder="0000"
                                        className="w-full bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-center tracking-[1em] text-2xl font-bold text-indigo-700"
                                        value={formData.passcode}
                                        onChange={e => setFormData({ ...formData, passcode: e.target.value.replace(/\D/g, "") })}
                                    />
                                </div>
                            </div>

                            {formError && <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100 italic">{formError}</p>}

                            <button
                                type="submit"
                                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] mt-2"
                            >
                                {editingStaff ? "Update System Access" : "Provision New Account"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

