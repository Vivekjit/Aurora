"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation"; // 👈 Add this

interface User {
    name: string; email: string; picture: string; username?: string;
    level?: number; streak?: number; total_impact?: number; global_rank?: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean; // 👈 Add this
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true); // 👈 New State
    const router = useRouter(); // 👈 New Hook

    useEffect(() => {
        const storedToken = localStorage.getItem("aurora_token");
        if (storedToken) {
            try {
                const decoded: any = jwtDecode(storedToken);
                // Optimistic set
                setUser({ name: decoded.name, email: decoded.email, picture: decoded.picture });

                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/user/get?email=${decoded.email}`)
                    .then(res => res.json())
                    .then(data => { if (data.username) setUser(prev => ({ ...prev!, ...data })); })
                    .catch(err => console.error(err))
                    .finally(() => setIsLoading(false)); // 👈 Turn off loading when done
            } catch (e) {
                localStorage.removeItem("aurora_token");
                setIsLoading(false); // 👈 Turn off loading on error
            }
        } else {
            setIsLoading(false); // 👈 Turn off loading if no token
        }
    }, []);

    const login = async (token: string) => {
        setIsLoading(true); // Start loading
        localStorage.setItem("aurora_token", token);
        const decoded: any = jwtDecode(token);
        setUser({ name: decoded.name, email: decoded.email, picture: decoded.picture });

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/google`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token })
            });
            // We can fetch fresh data here if needed, but the optimistic set is fast
            router.push("/"); // 👈 REDIRECT TO HOME
        } catch (error) { console.error(error); }
        finally { setIsLoading(false); }
    };

    const logout = () => {
        localStorage.removeItem("aurora_token");
        setUser(null);
        router.push("/login"); // 👈 REDIRECT TO LOGIN
    };

    return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
