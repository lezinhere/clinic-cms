import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { patientApi } from "../api/patient";

export default function PatientHistory() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [viewingReport, setViewingReport] = useState(null);

    useEffect(() => {
        if (user) {
            const paramId = searchParams.get('patientId');
            const targetId = (user.role === 'DOCTOR' && paramId) ? paramId : user.id;

            patientApi.getHistory(targetId).then((res) => {
                // Client-side filter as robust fallback for cancelled appointments
                const activeHistory = res.data.filter(apt => apt.status !== 'CANCELLED');
                setAppointments(activeHistory);
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [user, searchParams]);

    if (!user) return <div className="p-12 text-center text-gray-500 font-medium">Please authenticate to view medical records.</div>;

    if (loading) return (
        <div className="max-w-4xl mx-auto p-8 text-center">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-48 bg-gray-100 rounded-xl mb-8"></div>
                <div className="space-y-4 w-full">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-50 rounded-3xl w-full"></div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Clinical History</h1>
                    <p className="text-gray-500 mt-2 font-medium">Verified health records from CareConnect Stations</p>
                </div>
                <div className="h-14 w-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-teal-100">
                    📋
                </div>
            </div>

            <div className="space-y-8">
                {appointments.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem] p-20 text-center">
                        <div className="text-5xl mb-4 opacity-20">📂</div>
                        <p className="text-gray-400 font-bold text-lg">No clinical records found yet.</p>
                        <p className="text-gray-300 text-sm mt-1">Visit your doctor to start your health journey.</p>
                    </div>
                ) : appointments.map((apt) => (
                    <div key={apt.id} className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden transform transition-all hover:scale-[1.01]">
                        <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100">
                                    <span className="font-extrabold text-gray-800 text-sm">
                                        {new Date(apt.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <span className="text-gray-300">•</span>
                                <span className="text-gray-500 font-bold text-sm">Dr. {apt.doctor?.name}</span>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                apt.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                {apt.status}
                            </span>
                        </div>

                        {apt.consultation ? (
                            <div className="p-8 space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Diagnosis */}
                                    <div className="bg-indigo-50/30 p-5 rounded-2xl border border-indigo-50">
                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Primary Diagnosis</h4>
                                        <p className="text-gray-800 font-bold leading-relaxed">{apt.consultation.diagnosis || "General Consultation"}</p>
                                    </div>

                                    {/* Notes */}
                                    {apt.consultation.notes && (
                                        <div className="bg-amber-50/30 p-5 rounded-2xl border border-amber-50">
                                            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-2">Physician Notes</h4>
                                            <p className="text-gray-700 text-sm font-medium italic leading-relaxed">{apt.consultation.notes}</p>
                                        </div>
                                    )}

                                    {/* Next Visit Highlight */}
                                    {apt.consultation.nextVisitDate && (
                                        <div className="bg-teal-50 p-5 rounded-2xl border border-teal-100 flex items-center justify-between col-span-full md:col-span-1 shadow-sm">
                                            <div>
                                                <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] mb-1">Next Scheduled Visit</h4>
                                                <p className="text-lg font-black text-gray-800">
                                                    {new Date(apt.consultation.nextVisitDate).toLocaleDateString(undefined, {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm border border-teal-50">
                                                📅
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Prescriptions */}
                                {apt.consultation.prescriptions?.length > 0 && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">Pharmacy Orders</h4>
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            {apt.consultation.prescriptions.flatMap((p) => p.items).map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm group hover:border-teal-200 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center font-bold text-xs group-hover:bg-teal-600 group-hover:text-white transition-colors">Rx</div>
                                                        <span className="font-bold text-gray-800 text-sm">{item.medicine?.name}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-black text-teal-600 block">{item.dosage}</span>
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase">{item.duration}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Lab Reports */}
                                {apt.consultation.labRequests?.length > 0 && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">Laboratory Findings</h4>
                                        <div className="grid gap-3">
                                            {apt.consultation.labRequests.map((lab) => (
                                                <div key={lab.id} className="p-5 border border-gray-100 rounded-2xl flex justify-between items-center bg-white shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl">🧪</div>
                                                        <div>
                                                            <span className="font-bold text-gray-800">{lab.testName}</span>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{new Date(lab.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    {lab.status === 'COMPLETED' ? (
                                                        lab.resultReport?.startsWith('PDF Report:') ? (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    // Extract the DataURL or Link
                                                                    const url = lab.resultReport.replace('PDF Report:', '').trim();
                                                                    if (url) {
                                                                        setViewingReport(url);
                                                                    }
                                                                }}
                                                                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors flex items-center gap-2"
                                                            >
                                                                <span className="text-lg">📄</span> View Results
                                                            </button>
                                                        ) : (
                                                            <span className="text-green-600 font-black text-sm bg-green-50 px-4 py-2 rounded-xl border border-green-100">{lab.resultReport}</span>
                                                        )
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-amber-500 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                                                            <span className="animate-pulse">●</span>
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Processing</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-300 italic font-medium">
                                Waiting for final physician verification.
                            </div>
                        )}
                    </div>
                ))}
            </div>    {/* PDF Viewer Modal */}
            {viewingReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <span className="text-xl">📄</span> Medical Report Viewer
                            </h3>
                            <button
                                onClick={() => setViewingReport(null)}
                                className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors font-bold"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 bg-gray-100 p-2">
                            <iframe
                                src={viewingReport}
                                className="w-full h-full rounded-xl bg-white border border-gray-200"
                                title="Report Preview"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

