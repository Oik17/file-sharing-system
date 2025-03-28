'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [files, setFiles] = useState<File[]>([]);
    const [folders, setFolders] = useState<string[]>([]);
    const [folderName, setFolderName] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');

        if (!token) {
            router.push('/login'); // ✅ Redirect to login if no token
            return;
        }

        fetch('http://localhost:8080/files/get', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setFiles(data.files || []);
            setFolders(data.folders || []);
        })
        .catch(err => console.error('Error fetching data:', err));
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (!selectedFiles) return;

        const formData = new FormData();
        Array.from(selectedFiles).forEach(file => formData.append('files', file));

        const token = localStorage.getItem('jwt_token');
        if (!token) {
            router.push('/login'); // ✅ Redirect if no token
            return;
        }
        try {
            
        console.log({token})
            const response = await fetch('http://localhost:8080/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Upload failed');
            
            setFiles(prev => [...prev, ...Array.from(selectedFiles)]);
        } catch (error) {
            console.error('Error uploading files:', error);
        }
    };

        const handleCreateFolder = async () => {
            if (!folderName.trim()) return;
        
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                router.push('/login');
                return;
            }
        
            const formData = new FormData();
            formData.append("folder_name", folderName); 
            
            try {
                const response = await fetch('http://localhost:8080/files/createFolder', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}` 
                    },
                    body: formData
                });
        
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to create folder');
                }
                
                setFolders(prev => [...prev, folderName]);
                setFolderName('');
            } catch (error) {
                console.error('Error creating folder:', error);
            }
        };
      

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        router.push('/login');
    };

    return (
        <div className="p-6">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded">
                    Logout
                </button>
            </div>

            {/* File Upload */}
            <div className="mt-4">
                <input type="file" multiple onChange={handleFileUpload} className="border p-2" />
            </div>

            {/* Folder Creation */}
            <div className="mt-4">
                <input 
                    type="text" 
                    value={folderName} 
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="Enter folder name" 
                    className="border p-2 mr-2"
                />
                <button onClick={handleCreateFolder} className="bg-blue-500 text-white p-2 rounded">
                    Create Folder
                </button>
            </div>

            {/* Folder List */}
            <div className="mt-6">
                <h2 className="text-xl font-semibold">Folders</h2>
                <ul>
                    {folders.map((folder, idx) => (
                        <li key={idx} className="border p-2 my-1">📁 {folder}</li>
                    ))}
                </ul>
            </div>

            {/* File List */}
            <div className="mt-6">
                <h2 className="text-xl font-semibold">Files</h2>
                <ul>
                    {files.map((file, idx) => (
                        <li key={idx} className="border p-2 my-1">📄 {file.name}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
