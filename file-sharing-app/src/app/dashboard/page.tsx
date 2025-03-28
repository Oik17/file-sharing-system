'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
    const [files, setFiles] = useState<File[]>([]);
    const [folders, setFolders] = useState<string[]>([]);
    const [folderName, setFolderName] = useState('');
    
    useEffect(() => {
        // Fetch existing files and folders from API (mocked for now)
        setFiles([]);
        setFolders(['Documents', 'Images']);
    }, []);
    
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (!selectedFiles) return;
        
        const formData = new FormData();
        Array.from(selectedFiles).forEach(file => formData.append('files', file));
        
        try {
            await fetch('http://localhost:8080/upload', { method: 'POST', body: formData });
            setFiles(prev => [...prev, ...Array.from(selectedFiles)]);
        } catch (error) {
            console.error('Error uploading files:', error);
        }
    };
    
    const handleCreateFolder = async () => {
        if (!folderName.trim()) return;
        
        try {
            await fetch('http://localhost:8080/files/createFolder', { method: 'POST', body: JSON.stringify({ name: folderName }) });
            setFolders(prev => [...prev, folderName]);
            setFolderName('');
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };
    
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            
            <div className="mt-4">
                <input type="file" multiple onChange={handleFileUpload} className="border p-2" />
            </div>
            
            <div className="mt-4">
                <input 
                    type="text" 
                    value={folderName} 
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="Enter folder name" 
                    className="border p-2 mr-2"
                />
                <button onClick={handleCreateFolder} className="bg-blue-500 text-white p-2 rounded">Create Folder</button>
            </div>
            
            <div className="mt-6">
                <h2 className="text-xl font-semibold">Folders</h2>
                <ul>
                    {folders.map((folder, idx) => <li key={idx} className="border p-2 my-1">📁 {folder}</li>)}
                </ul>
            </div>
            
            <div className="mt-6">
                <h2 className="text-xl font-semibold">Files</h2>
                <ul>
                    {files.map((file, idx) => <li key={idx} className="border p-2 my-1">📄 {file.name}</li>)}
                </ul>
            </div>
        </div>
    );
}
