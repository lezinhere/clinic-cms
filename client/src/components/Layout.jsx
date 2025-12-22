import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = {
    PATIENT: [
        { label: "Book Appointment", href: "/patient/book" },
        { label: "My History", href: "/patient/history" },
    ],
    DOCTOR: [
        { label: "Active Appointments", href: "/doctor/dashboard" },
    ],
    PHARMACY: [
        { label: "Live Queue", href: "/pharmacy/queue" },
        { label: "Registry Archive", href: "/pharmacy/history" },
    ],
    LAB: [
        { label: "Pending Tests", href: "/lab/requests" },
        { label: "Lab History", href: "/lab/history" },
    ],
    ADMIN: [
        { label: "Staff Management", href: "/admin/dashboard" },
    ],
};

export default function Layout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location.pathname;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const FORCED_PUBLIC_ROUTES = ["/", "/care-connect", "/care-connect/login", "/patient/login"];
    const isForcedPublic = FORCED_PUBLIC_ROUTES.includes(pathname);

    if (!user || isForcedPublic) {
        return (
            <main className="min-h-screen">
                <Outlet />
            </main>
        );
    }

    const isPatientRoute = pathname.startsWith("/patient");
    if (isPatientRoute && user.role !== "PATIENT") {
        return (
            <main className="min-h-screen">
                <Outlet />
            </main>
        );
    }

    const items = NAV_ITEMS[user.role] || [];

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
            {/* Mobile Top Bar */}
            <div className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-50">
                <h1 className="text-xl font-bold text-blue-600">ClinicCMS</h1>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {isMobileMenuOpen ? "✕" : "☰"}
                </button>
            </div>

            {/* Overlay for mobile menu */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:shadow-md
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
                <div className="p-6 border-b flex flex-col">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-blue-600">ClinicCMS</h1>
                        <button className="md:hidden text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{user.name}</p>
                    <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded-full mt-2 self-start">
                        {user.role}
                    </span>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {items.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={`block px-4 py-2 rounded-lg transition-colors ${isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t">
                    <button
                        onClick={() => {
                            const isPatient = user?.role === "PATIENT";
                            logout();
                            if (isPatient) {
                                navigate("/patient");
                            } else {
                                navigate("/");
                            }
                        }}
                        className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-left font-medium transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 md:p-8">
                <Outlet />
            </main>
        </div>
    );
}
