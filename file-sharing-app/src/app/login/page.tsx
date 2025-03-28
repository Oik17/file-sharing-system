'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            fetch(`http://localhost:8080/callback?state=random&code=${code}`)
                .then(res => res.json())
                .then(data => {
                    if (data?.data?.access_token) {
                        localStorage.setItem('jwt_token', data.data.access_token);
                        setToken(data.data.access_token);
                        router.push('/dashboard'); // Redirect after login
                    }
                })
                .catch(err => console.error('Login Error:', err));
        }
    }, []);

    const handleLogin = () => {
        window.location.href = 'http://localhost:8080/login';
    };

    return (
        <div className="p-6 flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            {token ? (
                <p className="text-green-500">Logged in ✅ Redirecting...</p>
            ) : (
                <button 
                    onClick={handleLogin} 
                    className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition">
                    Login with Google
                </button>
            )}
        </div>
    );
}
