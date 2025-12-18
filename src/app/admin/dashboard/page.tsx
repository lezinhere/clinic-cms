"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { getAllStaff, createStaffMember, updateStaffMember, deleteStaffMember } from "@/app/actions/admin"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
    const { user } = useAuth()
    const router = useRouter()
    const [staff, setStaff] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingStaff, setEditingStaff] = useState<any>(null)

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        role: "DOCTOR",
        specialization: "",
        passcode: "",
        displayId: ""
    })
    const [formError, setFormError] = useState("")

    useEffect(() => {
        if (!user || user.role !== "ADMIN") {
            router.push("/care-connect/login")
            return
        }
        loadStaff()
    }, [user])

    async function loadStaff() {
        setLoading(true)
        const data = await getAllStaff()
        setStaff(data)
        setLoading(false)
    }

    const resetForm = () => {
        setFormData({ name: "", role: "DOCTOR", specialization: "", passcode: "", displayId: "" })
        setEditingStaff(null)
        setFormError("")
    }

    const openCreateModal = () => {
        resetForm()
        setModalOpen(true)
    }

    const openEditModal = (s: any) => {
        setEditingStaff(s)
        setFormData({
            name: s.name,
            role: s.role,
            specialization: s.specialization || "",
            passcode: s.passcode || "",
            displayId: s.displayId || ""
        })
        setModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError("")

        if (editingStaff) {
            const res = await updateStaffMember(editingStaff.id, formData)
            if (res.success) {
                setModalOpen(false)
                loadStaff()
            } else {
                setFormError(res.error || "Update failed")
            }
        } else {
            const res = await createStaffMember(formData)
            if (res.success) {
                setModalOpen(false)
                loadStaff()
            } else {
                setFormError(res.error || "Creation failed")
            }
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to remove this staff member?")) {
            const res = await deleteStaffMember(id)
            if (res.success) loadStaff()
        }
    }

    if (!user || user.role !== "ADMIN") return null

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Admin Command Center</h1>
                    <p className="text-gray-500">Manage clinic staff and system access</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                >
                    <span>+</span> Add New Staff
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Staff", value: staff.length, color: "blue" },
                    { label: "Doctors", value: staff.filter(s => s.role === 'DOCTOR').length, color: "green" },
                    { label: "Pharmacy", value: staff.filter(s => s.role === 'PHARMACY').length, color: "orange" },
                    { label: "Lab", value: staff.filter(s => s.role === 'LAB').length, color: "purple" },
                ].map((stat, i) => (
                    <div key={i} className={`bg-white p-6 rounded-2xl border-l-4 border-${stat.color}-500 shadow-sm`}>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Staff Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Staff Directory</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-widest">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">PIN</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={5} className="p-12 text-center text-gray-400">Syncing with database...</td></tr>
                            ) : staff.map((s) => (
                                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm text-gray-500">{s.displayId || '---'}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800">{s.name}</div>
                                        {s.specialization && <div className="text-xs text-gray-400">{s.specialization}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${s.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                                                s.role === 'DOCTOR' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {s.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-gray-400 tracking-widest">{s.passcode || '****'}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => openEditModal(s)} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">Edit</button>
                                        {s.displayId !== 'ADMIN-001' && (
                                            <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-600 font-medium text-sm">Remove</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            {editingStaff ? "Edit Staff Member" : "Add New Staff"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
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
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Display ID</label>
                                    <input
                                        type="text"
                                        placeholder="DOC-001"
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.displayId}
                                        onChange={e => setFormData({ ...formData, displayId: e.target.value })}
                                    />
                                </div>
                            </div>

                            {formData.role === 'DOCTOR' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Specialization</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.specialization}
                                        onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Security PIN (4 digits)</label>
                                <input
                                    type="text"
                                    maxLength={4}
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-center tracking-[0.5em] text-xl"
                                    value={formData.passcode}
                                    onChange={e => setFormData({ ...formData, passcode: e.target.value })}
                                />
                            </div>

                            {formError && <p className="text-red-500 text-xs font-medium">{formError}</p>}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                                >
                                    {editingStaff ? "Save Changes" : "Create User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
