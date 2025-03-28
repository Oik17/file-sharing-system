// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import FileList from '../components/FileList';
import FileUpload from '../components/FileUpload';
import CreateFolder from '../components/CreateFolder';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [currentFolder, setCurrentFolder] = useState('');
    const [refreshFiles, setRefreshFiles] = useState(0);

    const handleRefresh = () => {
        setRefreshFiles(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">File Sharing System</h1>
                    <div className="flex items-center space-x-4">
                        {user && <span className="text-gray-600">{user.email}</span>}
                        <button 
                            onClick={logout}
                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="flex flex-col md:flex-row md:space-x-6">
                            <div className="md:w-1/3 space-y-6">
                                <CreateFolder 
                                    currentFolder={currentFolder} 
                                    onFolderCreated={handleRefresh} 
                                />
                                <FileUpload 
                                    currentFolder={currentFolder} 
                                    onUploadComplete={handleRefresh} 
                                />
                            </div>
                            <div className="md:w-2/3 mt-6 md:mt-0">
                                <FileList 
                                    key={refreshFiles}
                                    onFolderChange={setCurrentFolder}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
