"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Use Next.js router
import { useAuth } from "../context/AuthContext";

const Callback = () => {
    const router = useRouter(); // ✅ Use Next.js `useRouter`
    const { setUser } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get the code from URL
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get("code");

                if (!code) {
                    throw new Error("No authorization code found in URL");
                }

                // Exchange code for user data
                const response = await fetch(
                    `http://localhost:8080/callback${window.location.search}`
                );
                const data = await response.json();

                if (data.status !== true) {
                    throw new Error(data.message || "Authentication failed");
                }

                // Set user in context
                setUser({
                    id: data.data.id,
                    email: data.data.email,
                    token: data.data.token,
                });

                // Redirect to dashboard
                router.push("/dashboard"); // ✅ Use Next.js `router.push`
            } catch (err) {
                console.error("Authentication error:", err);
                setError(err instanceof Error ? err.message : "Authentication failed");
            }
        };

        handleCallback();
    }, [router, setUser]); // ✅ Use `router` instead of `navigate`

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>Authentication Error: {error}</p>
                    <button
                        onClick={() => router.push("/")} // ✅ Use Next.js router
                        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="text-center">
                <p className="mb-4">Authenticating...</p>
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );
};

export default Callback;
