'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FolderIcon, 
  FileIcon, 
  LogOutIcon, 
  UploadCloudIcon, 
  FolderPlusIcon 
} from 'lucide-react';

export default function Dashboard() {
    const [files, setFiles] = useState<File[]>([]);
    const [folders, setFolders] = useState<string[]>([]);
    const [folderName, setFolderName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');

        if (!token) {
            router.push('/login');
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
            router.push('/login');
            return;
        }
        
        try {
            setIsUploading(true);
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
        } finally {
            setIsUploading(false);
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
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FolderIcon className="w-10 h-10 text-white" />
                        Dashboard
                    </h1>
                    <button 
                        onClick={handleLogout} 
                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                    >
                        <LogOutIcon className="w-5 h-5 text-white" />
                        Logout
                    </button>
                </div>

                {/* Actions Container */}
                <div className="p-6 grid md:grid-cols-2 gap-6">
                    {/* File Upload */}
                    <div className="bg-gray-100 rounded-lg p-4 border-2 border-dashed border-blue-200">
                        <input 
                            type="file" 
                            multiple 
                            ref={fileInputRef}
                            onChange={handleFileUpload} 
                            className="hidden" 
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center justify-center gap-3 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-all"
                            disabled={isUploading}
                        >
                            <UploadCloudIcon className="text-white" />
                            {isUploading ? 'Uploading...' : 'Upload Files'}
                        </button>
                    </div>

                    {/* Folder Creation */}
                    <div className="bg-gray-100 rounded-lg p-4 border-2 border-dashed border-green-200">
                        <div className="flex">
                            <input 
                                type="text" 
                                value={folderName} 
                                onChange={(e) => setFolderName(e.target.value)}
                                placeholder="Enter folder name" 
                                className="flex-grow p-2 rounded-l-lg border focus:ring-2 focus:ring-green-500 text-gray-800"
                            />
                            <button 
                                onClick={handleCreateFolder} 
                                className="bg-green-500 text-white p-2 rounded-r-lg hover:bg-green-600 transition-all flex items-center gap-2"
                            >
                                <FolderPlusIcon className="text-white" />
                                Create
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lists Container */}
                <div className="p-6 grid md:grid-cols-2 gap-6">
                    {/* Folder List */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                            <FolderIcon className="w-6 h-6 text-blue-500" />
                            Folders
                        </h2>
                        {folders.length === 0 ? (
                            <p className="text-gray-600">No folders yet</p>
                        ) : (
                            <ul className="space-y-2">
                                {folders.map((folder, idx) => (
                                    <li 
                                        key={idx} 
                                        className="bg-blue-50 p-3 rounded-lg flex items-center gap-3 hover:bg-blue-100 transition-all text-gray-800"
                                    >
                                        <FolderIcon className="w-5 h-5 text-blue-500" />
                                        {folder}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* File List */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                            <FileIcon className="w-6 h-6 text-green-500" />
                            Files
                        </h2>
                        {files.length === 0 ? (
                            <p className="text-gray-600">No files uploaded</p>
                        ) : (
                            <ul className="space-y-2">
                                {files.map((file, idx) => (
                                    <li 
                                        key={idx} 
                                        className="bg-green-50 p-3 rounded-lg flex items-center gap-3 hover:bg-green-100 transition-all text-gray-800"
                                    >
                                        <FileIcon className="w-5 h-5 text-green-500" />
                                        {file.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}