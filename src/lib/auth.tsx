"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { verifyStaffLogin } from "@/app/actions/auth"

export type User = {
    id: string
    name: string
    role: "PATIENT" | "DOCTOR" | "PHARMACY" | "LAB" | "ADMIN"
    passcode?: string // Staff passcode
    // Patient specific
    age?: number
    sex?: string
    phone?: string
    displayId?: string
}

interface AuthContextType {
    user: User | null
    login: (userId: string) => void
    loginWithPasscode: (staffId: string, passcode: string) => Promise<{ success: boolean, error?: string }>
    logout: () => void
    loginDirect: (user: User) => void
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => { },
    loginWithPasscode: async () => ({ success: false }),
    logout: () => { },
    loginDirect: () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)

    // Persist session
    useEffect(() => {
        const saved = localStorage.getItem("clinic_cms_user")
        if (saved) {
            setUser(JSON.parse(saved))
        }
    }, [])

    const login = (userId: string) => {
        // This is legacy for patient auto-login if still used. 
        // In a real app, this should also be DB backed.
    }

    const loginWithPasscode = async (staffId: string, passcode: string) => {
        const result = await verifyStaffLogin(staffId, passcode)

        if (result.success && result.user) {
            setUser(result.user)
            localStorage.setItem("clinic_cms_user", JSON.stringify(result.user))
            return { success: true }
        } else {
            return { success: false, error: result.error }
        }
    }

    const loginDirect = (userData: User) => {
        setUser(userData)
        localStorage.setItem("clinic_cms_user", JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("clinic_cms_user")
    }

    return (
        <AuthContext.Provider value={{ user, login, loginWithPasscode, logout, loginDirect }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
