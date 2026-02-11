"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation"; 

interface User {
    name: string; email: string; picture: string; username?: string;
    level?: number; streak?: number; total_impact?: number; global_rank?: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem("aurora_token");
        if (storedToken) {
            try {
                const decoded: any = jwtDecode(storedToken);
                // 1. Instant Optimistic Load
                setUser({ name: decoded.name, email: decoded.email, picture: decoded.picture });

                // 2. Silent Backend Sync (Doesn't block UI)
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/user/get?email=${decoded.email}`)
                    .then(res => res.json())
                    .then(data => { if (data.username) setUser(prev => ({ ...prev!, ...data })); })
                    .catch(err => console.error("Silent Sync Failed:", err))
                    .finally(() => setIsLoading(false)); 
            } catch (e) {
                localStorage.removeItem("aurora_token");
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (token: string) => {
        setIsLoading(true);
        localStorage.setItem("aurora_token", token);

        try {
            // 1. Decode & Set Google Data Immediately (Guarantees "Logged In" state)
            const decoded: any = jwtDecode(token);
            setUser({ 
                name: decoded.name, 
                email: decoded.email, 
                picture: decoded.picture 
            });

            // 2. Try Backend Sync (But don't let it stop us)
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/google`, {
                    method: "POST", 
                    headers: { "Content-Type": "application/json" }, 
                    body: JSON.stringify({ token })
                });
                
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        // Upgrade to Database Profile if available
                        setUser(prev => ({ 
                            ...prev!, 
                            ...data.user,
                            picture: data.user.picture || prev!.picture 
                        }));
                    }
                } else {
                    console.warn("Backend sync failed - Continuing with Google Profile");
                }
            } catch (backendErr) {
                console.error("Backend unreachable - Continuing Offline:", backendErr);
            }

            // 3. FORCE REDIRECT (This now runs no matter what happened above)
            router.push("/");

        } catch (error) { 
            console.error("Critical Login Error:", error);
            alert("Login failed. Please try again.");
        } finally { 
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("aurora_token");
        setUser(null);
        router.push("/login");
    };

    return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};