import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doctorApi } from "../api/doctor";

export default function ConsultationView() {
    const { appointmentId } = useParams();
    const navigate = useNavigate();

    // Data State
    const [patient, setPatient] = useState(null);
    const [doctor, setDoctor] = useState(null); // Capture doctor details
    const [loading, setLoading] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [debugData, setDebugData] = useState(null);
    const [fallbackStatus, setFallbackStatus] = useState("Idle");

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
        console.log("Fetching appointment:", appointmentId);
        doctorApi.getAppointment(appointmentId)
            .then(res => {
                console.log("Fetch result:", res.data);
                if (res.data) {
                    const apt = res.data;
                    setDebugData(apt); // Capture raw response for debugging
                    console.log("Full Appointment Data:", apt);
                    if (apt.doctor && apt.doctor.name) {
                        setDoctor(apt.doctor);
                        setFallbackStatus("Main Data OK");
                    } else if (apt.doctorId) {
                        console.log("Doctor data missing or incomplete, forcing fallback...", apt.doctorId);
                        setFallbackStatus("Fetching Fallback...");
                        doctorApi.getDoctorById(apt.doctorId)
                            .then(docRes => {
                                console.log("Fetched Doctor Fallback:", docRes.data);
                                setDoctor(docRes.data);
                                setFallbackStatus("Fallback Success");
                            })
                            .catch(e => {
                                console.error("Fallback fetch failed", e);
                                const errMsg = e.response?.data?.error || e.message;
                                setLoadError("Doctor Data Fetch Failed");
                                setFallbackStatus("Fallback Failed: " + errMsg);
                            });
                    }

                    const displayPatient = {
                        ...apt.patient,
                        name: apt.patientName || apt.patient.name,
                        age: apt.patientAge || apt.patient.age,
                        sex: apt.patientGender || apt.patient.sex
                    };
                    setPatient(displayPatient);
                }
            })
            .catch(err => {
                console.error("Failed to load appointment", err);
                // alert("Failed to load appointment details. Please try again."); // Comment out for debug
                setPatient(null);
                setDoctor(null);
                // We'll show the error in the render
                setLoadError(err.message || "Unknown Error");
                // navigate("/doctor/dashboard"); // Disable auto-redirect for debug
            });
    }, [appointmentId, navigate]);

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
            console.error("Submission error:", err);
            const errMsg = err.response?.data?.error || err.message || "Unknown connection error";
            alert(`Submission Failed: ${errMsg}`);
        }
        setLoading(false);
        setShowSummary(false);
    };

    console.log("ConsultationView Render. Patient:", patient);

    if (!patient) return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-teal-600 font-bold text-xl">
            <span className="animate-pulse">Loading Patient Data...</span>
            {loadError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded text-red-600 font-mono text-sm max-w-md">
                    API Error: {loadError}
                </div>
            )}
            <div className="text-xs text-gray-500 font-mono">
                Debug: {JSON.stringify({ appointmentId, doctorState: doctor })}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-3 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-teal-600 text-white rounded-lg flex items-center justify-center text-xl font-bold">Rx</div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-none">Clinical Workspace <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full ml-2">v1.6-Debug</span></h1>
                        <p className="text-xs font-medium text-gray-500 mt-1">APT-{appointmentId.slice(-4)} • <span className="text-teal-600">Active Session</span></p>
                    </div>
                </div>
                <button
                    onClick={() => navigate("/doctor/dashboard")}
                    className="px-4 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg text-sm font-medium transition-all"
                >
                    Close & Exit
                </button>
            </header>

            <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Review Modal - Screen Only */}
                {showSummary && (
                    <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                                <h2 className="text-xl font-bold text-gray-900">Medical Prescription & Report</h2>
                                <button onClick={() => setShowSummary(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>

                            <div className="p-8 overflow-y-auto space-y-6">
                                {/* Screen Preview Content */}
                                <div className="flex gap-6 p-4 bg-teal-50/50 rounded-xl border border-teal-100 items-center">
                                    <div className="h-14 w-14 bg-white text-teal-700 rounded-full flex items-center justify-center font-bold text-xl border-2 border-teal-100 shadow-sm">
                                        {patient?.name?.charAt(0) || "?"}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-teal-600 uppercase tracking-wider">Patient</div>
                                        <div className="text-lg font-bold text-gray-900">{patient?.name || "Unknown"}</div>
                                        {/* Debug info - remove after fixing */}
                                        <div className="text-[10px] text-gray-400 font-mono mt-2">
                                            Doc: {doctor ? `${doctor.name} (${doctor.specialization})` : "NULL"}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-gray-400 uppercase">Diagnosis</div>
                                        <div className="font-semibold text-gray-800 font-serif">{diagnosis}</div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="text-xs font-bold text-gray-400 uppercase">Next Review</div>
                                        <div className="font-semibold text-gray-800 font-serif">{nextVisit || "Not Scheduled"}</div>
                                    </div>
                                </div>

                                {(prescriptions.length > 0) && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-xl font-serif font-bold text-slate-900">Rx</span>
                                            <div className="h-px bg-slate-200 flex-1"></div>
                                        </div>
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs tracking-wider">
                                                <tr>
                                                    <th className="px-4 py-2">Medicine</th>
                                                    <th className="px-4 py-2">Dosage</th>
                                                    <th className="px-4 py-2 text-right">Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {prescriptions.map((p, i) => (
                                                    <tr key={i}>
                                                        <td className="px-4 py-3 font-bold text-gray-800 font-serif">{p.medicineName}</td>
                                                        <td className="px-4 py-3 font-mono text-slate-600">{p.dosage}</td>
                                                        <td className="px-4 py-3 text-right text-slate-600">{p.period}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {labRequests.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Lab Investigations</span>
                                            <div className="h-px bg-slate-200 flex-1"></div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {labRequests.map((l, i) => (
                                                <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 rounded border border-purple-100 text-xs font-medium">
                                                    • {l.testName}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {notes && (
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                        <div className="text-xs font-bold text-amber-600 uppercase mb-1">Advice / Notes</div>
                                        <p className="text-sm text-gray-700 italic font-serif">{notes}</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end">
                                <button onClick={() => window.print()} className="px-6 py-2.5 text-blue-600 font-bold hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors flex items-center gap-2">
                                    <span>🖨️</span> Print
                                </button>
                                <button onClick={() => setShowSummary(false)} className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">Back</button>
                                <button onClick={handleConfirmSubmit} disabled={loading} className="px-6 py-2.5 bg-teal-600 text-white font-bold rounded-lg shadow-sm hover:bg-teal-700 transition-all">
                                    {loading ? "Submitting..." : "Confirm & Sign"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* DEDICATED PRINT VIEW - Outside Modal Stacking Context */}
                {showSummary && (
                    <div id="printable-section" className="hidden print:block fixed inset-0 bg-white z-[10000] p-10 font-serif text-black h-[100vh] w-[100vw] overflow-visible top-0 left-0 m-0">
                        {/* Header: Doctor & Date */}
                        <div className="flex justify-between items-start mb-1">
                            <div>
                                <h1 className="text-3xl font-bold text-black mb-1">Dr. {doctor?.name || "Doctor"}</h1>
                                <p className="text-sm font-bold text-black uppercase tracking-wider">{doctor?.specialization || "General Physician"}</p>
                                {!doctor?.name && (
                                    <div className="text-[10px] font-mono text-red-500 break-words w-96 border border-red-500 p-1 bg-red-50">
                                        DEBUG RAW: {JSON.stringify(debugData)}
                                        <br />
                                        <strong>Global Doc State: {JSON.stringify(doctor)}</strong>
                                        <br />
                                        <strong>Status: {fallbackStatus}</strong>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-end gap-2 mt-4">
                                <span className="font-bold text-sm">Date:</span>
                                <div className="border-b border-gray-900 w-32 text-center pb-1 text-sm font-bold">
                                    {new Date().toLocaleDateString('en-GB')}
                                </div>
                            </div>
                        </div>

                        {/* Purple Separator */}
                        <div className="h-1.5 bg-[#8B5CF6] w-full mb-10 mt-2"></div>

                        {/* Patient Details */}
                        <div className="flex flex-col gap-6 mb-12">
                            <div className="flex items-end gap-2 w-2/3">
                                <span className="font-bold text-sm whitespace-nowrap">Patient's name:</span>
                                <div className="border-b border-gray-400 flex-1 text-lg font-bold px-2 pb-0 relative translate-y-1">
                                    {patient?.name}
                                </div>
                            </div>
                            <div className="flex items-end gap-2 w-1/3">
                                <span className="font-bold text-sm">Age:</span>
                                <div className="border-b border-gray-400 flex-1 text-lg font-bold px-2 pb-0 text-center relative translate-y-1">
                                    {patient?.age}
                                </div>
                            </div>
                        </div>

                        {/* RX Symbol */}
                        <div className="mb-6">
                            <h1 className="text-7xl font-serif">RX</h1>
                        </div>

                        {/* Prescription Content */}
                        <div className="min-h-[400px]">
                            {/* Diagnosis */}
                            {diagnosis && (
                                <div className="mb-6">
                                    <span className="font-bold underline">Diagnosis:</span> <span className="font-medium">{diagnosis}</span>
                                </div>
                            )}

                            {/* Medicines List - Table Format */}
                            {prescriptions.length > 0 && (
                                <div className="ml-0 mt-6 mb-8">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-400">
                                                <th className="py-2 text-sm font-bold w-12 text-center">Sl.No</th>
                                                <th className="py-2 text-sm font-bold">Medicine Name</th>
                                                <th className="py-2 text-sm font-bold">Dosage</th>
                                                <th className="py-2 text-sm font-bold">Period</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {prescriptions.map((p, i) => (
                                                <tr key={i} className="border-b border-gray-200">
                                                    <td className="py-3 text-sm text-center font-semibold">{i + 1}</td>
                                                    <td className="py-3 text-lg font-bold">{p.medicineName}</td>
                                                    <td className="py-3 text-base font-medium">{p.dosage}</td>
                                                    <td className="py-3 text-base">{p.period}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Lab Requests */}
                            {labRequests.length > 0 && (
                                <div className="mt-10">
                                    <h4 className="font-bold underline mb-3 text-lg">Lab Investigations:</h4>
                                    <ul className="list-disc pl-6 space-y-2 text-lg">
                                        {labRequests.map((l, i) => (
                                            <li key={i}>{l.testName}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Notes */}
                            {notes && (
                                <div className="mt-10 pt-4 border-t border-gray-100 italic text-sm text-gray-600">
                                    Note: {notes}
                                </div>
                            )}
                        </div>

                        {/* Footer: Signature */}
                        <div className="fixed bottom-12 right-12 w-64">
                            <div className="text-center">
                                <div className="border-t border-gray-900 w-full mb-2"></div>
                                <span className="text-lg font-bold">Signature</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* LEFT COLUMN: Patient Info & Findings */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Patient Card */}
                    <section className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                        <div className="h-2 bg-teal-500 w-full"></div>
                        <div className="p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="h-16 w-16 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-teal-100">
                                    {patient?.name?.charAt(0) || "?"}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{patient?.name || "Unknown Patient"}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded uppercase">{(patient?.sex || "UNK").substring(0, 1)}</span>
                                        <span className="text-sm font-medium text-gray-500">{patient?.age || "?"} Years</span>
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1 font-mono">{patient?.phone || "No Phone"}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(`/patient/history?patientId=${patient.id}`)}
                                className="w-full py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all text-sm flex items-center justify-center gap-2"
                            >
                                <span>View History</span>
                                <span className="text-gray-400">→</span>
                            </button>
                        </div>
                    </section>

                    {/* Clinical Findings */}
                    <section className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-6 flex flex-col h-fit">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Clinical Findings
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Diagnosis</label>
                                <input
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl outline-none transition-all font-medium text-gray-900"
                                    placeholder="e.g. Viral Fever"
                                    value={diagnosis}
                                    onChange={e => setDiagnosis(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Notes / Advice</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl outline-none transition-all h-32 resize-none font-medium text-gray-900 text-sm leading-relaxed"
                                    placeholder="Patient complaints, internal notes..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Next Visit</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl outline-none transition-all font-medium text-gray-700"
                                    value={nextVisit}
                                    onChange={e => setNextVisit(e.target.value)}
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* RIGHT COLUMN: Rx & Labs */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Prescription Section */}
                    <section className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-6 flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Prescriptions
                            </h3>
                            <span className="text-xs font-medium text-gray-400">{prescriptions.length} Items</span>
                        </div>

                        {/* Search */}
                        <div className="relative mb-6 z-20">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                                <input
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-xl outline-none transition-all font-medium text-gray-900 shadow-sm"
                                    placeholder="Search medicines..."
                                    value={medQuery}
                                    onChange={e => setMedQuery(e.target.value)}
                                />
                                {medQuery && !medSuggestions.length && (
                                    <button
                                        onClick={() => addMedicine(medQuery)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition"
                                    >
                                        ADD NEW
                                    </button>
                                )}
                            </div>
                            {medSuggestions.length > 0 && (
                                <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
                                    {medSuggestions.map(m => (
                                        <div key={m.id} onClick={() => addMedicine(m.name)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm font-medium text-gray-700 border-b border-gray-50 last:border-0 transition-colors">
                                            {m.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Table */}
                        <div className="overflow-hidden rounded-xl border border-gray-100">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Medicine</th>
                                        <th className="px-4 py-3 w-32">Full Cycle</th>
                                        <th className="px-4 py-3 w-32">Days</th>
                                        <th className="px-4 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {prescriptions.map((p, idx) => (
                                        <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-bold text-gray-800">{p.medicineName}</td>
                                            <td className="px-4 py-3">
                                                <input
                                                    className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-center font-medium"
                                                    value={p.dosage}
                                                    onChange={e => { const n = [...prescriptions]; n[idx].dosage = e.target.value; setPrescriptions(n); }}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-center font-medium"
                                                    value={p.period}
                                                    onChange={e => { const n = [...prescriptions]; n[idx].period = e.target.value; setPrescriptions(n); }}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => removeMedicine(idx)} className="text-gray-300 hover:text-red-500 text-lg transition-colors">×</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {prescriptions.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-gray-400 italic">No medicines added yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Labs & Action */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-6 flex flex-col">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Lab Orders
                            </h3>
                            <div className="relative mb-4">
                                <input
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 rounded-xl outline-none transition-all text-sm font-medium"
                                    placeholder="Add test..."
                                    value={labQuery}
                                    onChange={e => setLabQuery(e.target.value)}
                                />
                                {labSuggestions.length > 0 && (
                                    <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20">
                                        {labSuggestions.map(l => (
                                            <div key={l.id} onClick={() => addLab(l.name)} className="px-4 py-2.5 hover:bg-purple-50 cursor-pointer text-sm font-medium text-gray-700 transition-colors">
                                                {l.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {labQuery && !labSuggestions.length && <button onClick={() => addLab(labQuery)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-600 px-2 py-1 bg-purple-50 rounded">ADD</button>}
                            </div>
                            <div className="flex flex-wrap gap-2 content-start flex-1">
                                {labRequests.map((l, i) => (
                                    <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-100 flex items-center gap-2">
                                        {l.testName}
                                        <button onClick={() => { const n = [...labRequests]; n.splice(i, 1); setLabRequests(n) }} className="hover:text-purple-900">×</button>
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section className="flex flex-col justify-end">
                            <button
                                onClick={handlePreSubmit}
                                disabled={loading}
                                className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold text-lg rounded-2xl shadow-xl shadow-gray-200 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>Complete Session</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                            <p className="text-center text-xs font-medium text-gray-400 mt-3">Double-check all entries before signing.</p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
