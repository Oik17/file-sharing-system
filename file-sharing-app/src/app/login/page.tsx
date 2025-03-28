'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const router = useRouter();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('access_token');

        console.log("Extracted Token:", token); // ✅ Log the token first

        if (token) {
            localStorage.setItem('jwt_token', token);
            setTimeout(() => { // ✅ Give some time before redirecting
                router.push('/dashboard');
            }, 1000);
        }
    }, []);

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/login'; // Redirect to backend login
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            <button onClick={handleGoogleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">
                Login with Google
            </button>
        </div>
    );
}
