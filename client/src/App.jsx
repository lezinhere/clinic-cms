import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import LandingPage from './pages/LandingPage';
import CareConnect from './pages/CareConnect';
import ProviderLoginPage from './pages/ProviderLoginPage';
import PatientLoginPage from './pages/PatientLoginPage';
import PatientHome from './pages/PatientHome';
import BookingWizard from './pages/BookingWizard';
import PatientHistory from './pages/PatientHistory';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ConsultationView from './pages/ConsultationView';
import PharmacyQueue from './pages/PharmacyQueue';
import PharmacyHistory from './pages/PharmacyHistory';
import LabRequests from './pages/LabRequests';
import LabHistory from './pages/LabHistory';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="care-connect" element={<CareConnect />} />
            <Route path="care-connect/login" element={<ProviderLoginPage />} />
            <Route path="patient" element={<PatientHome />} />
            <Route path="patient/login" element={<PatientLoginPage />} />
            <Route path="patient/book" element={<BookingWizard />} />
            <Route path="patient/history" element={<PatientHistory />} />

            {/* Protected Routes */}
            <Route path="doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="doctor/consult/:appointmentId" element={<ConsultationView />} />
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="pharmacy/queue" element={<PharmacyQueue />} />
            <Route path="pharmacy/history" element={<PharmacyHistory />} />
            <Route path="lab/requests" element={<LabRequests />} />
            <Route path="lab/history" element={<LabHistory />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
