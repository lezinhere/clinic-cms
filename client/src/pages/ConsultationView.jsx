import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doctorApi } from "../api/doctor";

export default function ConsultationView() {
    const { appointmentId } = useParams();
    const navigate = useNavigate();

    // Data State
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSummary, setShowSummary] = useState(false);

    // Form State
    const [diagnosis, setDiagnosis] = useState("");
    const [notes, setNotes] = useState("");
    const [nextVisit, setNextVisit] = useState("");

    // Medicines State
    const [medQuery, setMedQuery] = useState("");
    const [medSuggestions, setMedSuggestions] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);

    // Lab State
    const [labQuery, setLabQuery] = useState("");
    const [labSuggestions, setLabSuggestions] = useState([]);
    const [labRequests, setLabRequests] = useState([]);

    // Load Appointment & Patient
    useEffect(() => {
        doctorApi.getAppointment(appointmentId).then(res => {
            if (res.data) {
                setPatient(res.data.patient);
            }
        });
    }, [appointmentId]);

    // Search Medicines Debounce
    useEffect(() => {
        const delay = setTimeout(() => {
            if (medQuery.length > 1) {
                doctorApi.searchMedicines(medQuery).then(res => setMedSuggestions(res.data));
            } else {
                setMedSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(delay);
    }, [medQuery]);

    // Search Lab Tests Debounce
    useEffect(() => {
        const delay = setTimeout(() => {
            if (labQuery.length > 1) {
                doctorApi.searchLabs(labQuery).then(res => setLabSuggestions(res.data));
            } else {
                setLabSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(delay);
    }, [labQuery]);

    const addMedicine = (name) => {
        setPrescriptions([...prescriptions, { medicineName: name, dosage: "1-0-1", period: "5 Days" }]);
        setMedQuery("");
        setMedSuggestions([]);
    };

    const removeMedicine = (index) => {
        const newPs = [...prescriptions];
        newPs.splice(index, 1);
        setPrescriptions(newPs);
    };

    const addLab = (name) => {
        setLabRequests([...labRequests, { testName: name }]);
        setLabQuery("");
        setLabSuggestions([]);
    };

    const handlePreSubmit = () => {
        if (!diagnosis) {
            alert("Please enter a diagnosis");
            return;
        }
        setShowSummary(true);
    };

    const handleConfirmSubmit = async () => {
        setLoading(true);
        try {
            const mappedPrescriptions = prescriptions.map(p => ({
                medicineName: p.medicineName,
                dosage: p.dosage,
                duration: p.period
            }));

            const res = await doctorApi.submitConsultation({
                appointmentId,
                diagnosis,
                notes,
                nextVisitDate: nextVisit || null,
                prescriptions: mappedPrescriptions,
                labRequests
            });

            if (res.data.success) {
                navigate("/doctor/dashboard");
            } else {
                alert(`Failed to submit: ${res.data.error}`);
            }
        } catch (err) {
            alert("Connection error during submission");
        }
        setLoading(false);
        setShowSummary(false);
    };

    if (!patient) return (
        <div className="min-h-screen flex items-center justify-center text-teal-600 animate-pulse font-bold text-xl">
            Accessing Health Records...
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 pb-32 relative">
            {/* Review Modal */}
            {showSummary && (
                <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
                        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Clinical Summary</h2>
                            <button onClick={() => setShowSummary(false)} className="h-10 w-10 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-400 hover:text-gray-600 transition-all">×</button>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="flex items-center gap-4 bg-teal-50/30 p-4 rounded-2xl border border-teal-50">
                                <div className="h-12 w-12 bg-teal-600 text-white rounded-xl flex items-center justify-center font-bold text-xl italic">{patient.name.charAt(0)}</div>
                                <div>
                                    <p className="text-sm font-black text-teal-600 uppercase tracking-widest">Selected Patient</p>
                                    <p className="text-lg font-bold text-gray-900">{patient.name}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Diagnosis</p>
                                    <p className="font-bold text-gray-800 border-l-4 border-teal-500 pl-3">{diagnosis}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Follow-up</p>
                                    <p className="font-bold text-gray-800">{nextVisit || "Immediate"}</p>
                                </div>
                            </div>

                            {prescriptions.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Prescription List</p>
                                    <div className="space-y-2">
                                        {prescriptions.map((p, i) => (
                                            <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                <span className="font-bold text-gray-800 text-sm">{p.medicineName}</span>
                                                <span className="text-[10px] font-black bg-teal-50 text-teal-600 px-3 py-1 rounded-lg uppercase">{p.dosage} • {p.period}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {labRequests.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Diagnostic Orders</p>
                                    <div className="flex flex-wrap gap-2">
                                        {labRequests.map((l, i) => (
                                            <span key={i} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-wider border border-indigo-100">{l.testName}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 border-t bg-gray-50 flex gap-4">
                            <button onClick={() => setShowSummary(false)} className="flex-1 py-4 bg-white text-gray-400 font-bold rounded-2xl border border-gray-200 hover:text-gray-600 transition-all">Revise Data</button>
                            <button
                                onClick={handleConfirmSubmit}
                                disabled={loading}
                                className="flex-[2] py-4 bg-teal-600 text-white font-black rounded-2xl shadow-xl shadow-teal-100 hover:bg-teal-700 transition-all uppercase tracking-widest text-sm"
                            >
                                {loading ? "Signing & Sending..." : "Authorize Submission"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-50">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-teal-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black italic shadow-lg shadow-teal-100">Rx</div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Clinical Workspace</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Session • APT-{appointmentId.slice(-4)}</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate("/doctor/dashboard")}
                    className="px-6 py-2 text-gray-400 hover:text-gray-900 font-bold transition-all text-sm uppercase tracking-widest"
                >
                    Close Session
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT: Patient & Diagnosis */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-50 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-2 h-full bg-teal-600 group-hover:w-3 transition-all"></div>
                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="h-24 w-24 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center text-4xl font-black italic mb-6 border-4 border-white shadow-xl shadow-teal-50">
                                {patient.name.charAt(0)}
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{patient.name}</h2>
                            <p className="text-gray-400 font-bold text-sm mt-1">{patient.sex.toUpperCase()} • {patient.age} YEARS</p>

                            <div className="mt-8 w-full p-6 bg-slate-50 rounded-3xl space-y-4">
                                <div className="flex justify-between items-center text-left">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile</span>
                                    <p className="font-bold text-gray-800 text-sm">{patient.phone || "UNLINKED"}</p>
                                </div>
                                <div className="flex justify-between items-center text-left border-t border-gray-100 pt-4">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">History</span>
                                    <button
                                        onClick={() => navigate(`/patient/history?patientId=${patient.id}`)}
                                        className="bg-white px-4 py-1.5 border border-gray-200 rounded-full text-[10px] font-black text-teal-600 hover:bg-teal-600 hover:text-white transition-all shadow-sm"
                                    >
                                        VIEW RECORDS
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-[3.5rem] shadow-xl shadow-gray-100 border border-gray-50 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs shadow-sm">📝</div>
                            <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Findings</h3>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Clinical Diagnosis</label>
                                <input
                                    className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-teal-500 rounded-[2rem] outline-none transition-all font-bold text-gray-800 placeholder:text-gray-300 shadow-inner"
                                    placeholder="e.g. Acute Gastritis"
                                    value={diagnosis}
                                    onChange={e => setDiagnosis(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Follow-up Date</label>
                                <input
                                    type="date"
                                    className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-teal-500 rounded-[2rem] outline-none transition-all font-bold text-teal-700 shadow-inner"
                                    value={nextVisit}
                                    onChange={e => setNextVisit(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Physician Advice</label>
                                <textarea
                                    className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-teal-500 rounded-[2.5rem] outline-none transition-all h-32 resize-none font-medium text-gray-700 shadow-inner"
                                    placeholder="Rest, hydration, avoid oily food..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* RIGHT: Prescriptions & Labs */}
                <div className="lg:col-span-8 space-y-8">
                    <section className="bg-white p-10 rounded-[4rem] shadow-2xl border border-gray-50 min-h-[500px] flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-blue-100">💊</div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Active Prescription</h3>
                            </div>
                        </div>

                        {/* Medicine Search */}
                        <div className="relative mb-10">
                            <div className="relative group">
                                <input
                                    className="w-full p-7 pl-16 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-[2.5rem] outline-none transition-all font-bold text-lg text-gray-800 shadow-inner placeholder:text-gray-300"
                                    placeholder="Catalog search (e.g. Paracetamol)..."
                                    value={medQuery}
                                    onChange={e => setMedQuery(e.target.value)}
                                />
                                <span className="absolute left-7 top-1/2 -translate-y-1/2 text-2xl group-focus-within:scale-110 transition-transform">🔍</span>
                            </div>

                            {medSuggestions.length > 0 && (
                                <div className="absolute top-full mt-4 left-0 right-0 bg-white rounded-[2.5rem] shadow-2xl border border-blue-50 z-50 overflow-hidden animate-in slide-in-from-top-4 duration-300">
                                    {medSuggestions.map(m => (
                                        <div
                                            key={m.id}
                                            onClick={() => addMedicine(m.name)}
                                            className="px-8 py-5 hover:bg-blue-50 cursor-pointer flex justify-between items-center group/item transition-colors"
                                        >
                                            <span className="font-bold text-gray-700 tracking-tight">{m.name}</span>
                                            <span className="text-blue-500 text-[10px] font-black uppercase opacity-0 group-hover/item:opacity-100 transition-all tracking-widest">Select Item</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {medQuery.length > 0 && medSuggestions.length === 0 && (
                                <button
                                    onClick={() => addMedicine(medQuery)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-3 bg-blue-600 text-white text-[10px] font-black rounded-3xl hover:bg-blue-700 transition-all uppercase tracking-widest shadow-lg shadow-blue-100"
                                >
                                    Draft New Rx
                                </button>
                            )}
                        </div>

                        {/* Table */}
                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] border-b border-gray-50">
                                    <tr>
                                        <th className="pb-6 px-4">Identifier</th>
                                        <th className="pb-6 px-4">Medication</th>
                                        <th className="pb-6 px-4">Regimen</th>
                                        <th className="pb-6 px-4">Cycle</th>
                                        <th className="pb-6 px-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {prescriptions.map((p, idx) => (
                                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="py-6 px-4">
                                                <div className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center font-black text-[10px] text-gray-400 border border-gray-100">
                                                    0{idx + 1}
                                                </div>
                                            </td>
                                            <td className="py-6 px-4 font-black text-gray-800">{p.medicineName}</td>
                                            <td className="py-6 px-4">
                                                <input
                                                    className="w-full bg-slate-100/50 p-3 rounded-xl border border-transparent focus:border-blue-300 outline-none text-xs font-bold text-blue-700 transition-all"
                                                    value={p.dosage}
                                                    onChange={e => {
                                                        const newPs = [...prescriptions];
                                                        newPs[idx].dosage = e.target.value;
                                                        setPrescriptions(newPs);
                                                    }}
                                                />
                                            </td>
                                            <td className="py-6 px-4">
                                                <input
                                                    className="w-full bg-slate-100/50 p-3 rounded-xl border border-transparent focus:border-blue-300 outline-none text-xs font-bold text-blue-700 transition-all"
                                                    value={p.period}
                                                    onChange={e => {
                                                        const newPs = [...prescriptions];
                                                        newPs[idx].period = e.target.value;
                                                        setPrescriptions(newPs);
                                                    }}
                                                />
                                            </td>
                                            <td className="py-6 px-4 text-right">
                                                <button
                                                    onClick={() => removeMedicine(idx)}
                                                    className="h-10 w-10 flex items-center justify-center rounded-full text-gray-200 hover:text-red-500 hover:bg-red-50 transition-all font-bold text-2xl"
                                                >
                                                    ×
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {prescriptions.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center">
                                                <div className="text-4xl mb-4 opacity-20">🏥</div>
                                                <p className="text-gray-300 font-bold uppercase tracking-widest text-[10px]">Awaiting Prescription Input</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="bg-white p-10 rounded-[4rem] shadow-xl shadow-gray-100 border border-gray-50">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-xl border border-purple-100">🧪</div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-sm">Diagnostic Routing</h3>
                        </div>

                        <div className="relative mb-6">
                            <input
                                className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-purple-500 rounded-[2.5rem] outline-none transition-all font-bold text-gray-800 placeholder:text-gray-300 shadow-inner"
                                placeholder="Request a new clinical test..."
                                value={labQuery}
                                onChange={e => setLabQuery(e.target.value)}
                            />

                            {labSuggestions.length > 0 && (
                                <div className="absolute top-full mt-4 left-0 right-0 bg-white rounded-[2rem] shadow-2xl border border-purple-50 z-50 overflow-hidden animate-in zoom-in duration-200">
                                    {labSuggestions.map(l => (
                                        <div
                                            key={l.id}
                                            onClick={() => addLab(l.name)}
                                            className="px-8 py-4 hover:bg-purple-50 cursor-pointer flex justify-between items-center transition-colors"
                                        >
                                            <span className="font-bold text-gray-700 text-sm tracking-tight">{l.name}</span>
                                            <span className="text-purple-500 text-[9px] font-black uppercase tracking-widest">Add Order</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {labQuery.length > 0 && labSuggestions.length === 0 && (
                                <button
                                    onClick={() => addLab(labQuery)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-purple-600 text-white text-[9px] font-black rounded-3xl hover:bg-purple-700 transition-all uppercase tracking-widest"
                                >
                                    + Custom Lab
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {labRequests.map((l, idx) => (
                                <span key={idx} className="group inline-flex items-center gap-3 px-5 py-2.5 bg-purple-50 text-purple-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100 shadow-sm transition-all hover:bg-purple-100">
                                    {l.testName}
                                    <button
                                        onClick={() => {
                                            const newL = [...labRequests];
                                            newL.splice(idx, 1);
                                            setLabRequests(newL);
                                        }}
                                        className="text-purple-300 group-hover:text-purple-900 font-bold transition-colors"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            {labRequests.length === 0 && <p className="text-gray-300 italic text-xs font-medium py-2">No active laboratory orders.</p>}
                        </div>
                    </section>

                    <div className="pt-4 animate-in slide-in-from-bottom-8 duration-500">
                        <button
                            onClick={handlePreSubmit}
                            disabled={loading}
                            className="w-full py-7 bg-gradient-to-r from-teal-600 via-teal-700 to-indigo-700 hover:from-teal-700 hover:to-indigo-800 text-white font-black text-xl rounded-[3rem] shadow-2xl shadow-teal-100 transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-[0.1em]"
                        >
                            Authorize Consultation Registry
                        </button>
                        <p className="text-center text-[10px] font-black text-gray-300 mt-6 uppercase tracking-widest">
                            Official Digital Signature Required in Next Step
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

