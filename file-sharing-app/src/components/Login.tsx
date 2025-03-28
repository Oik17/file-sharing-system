// src/components/Login.tsx
import React from 'react';

const Login = () => {
    const handleLogin = () => {
        window.location.href = 'http://localhost:8080/login';
    };

    return (
        <div className='flex flex-col items-center justify-center min-h-screen'>
            <h1 className='text-2xl font-bold mb-4'>File Sharing System</h1>
            <button 
                onClick={handleLogin} 
                className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded'
            >
                Login with Google
            </button>
        </div>
    );
};

export default Login;
