'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FolderIcon, 
  FileIcon, 
  LogOutIcon, 
  UploadCloudIcon, 
  FolderPlusIcon,
  ChevronLeftIcon,
  HomeIcon,
  PlusIcon
} from 'lucide-react';

interface Folder {
  id: string;
  name: string;
  level: number;
  created_at: string;
  updated_at: string;
  is_folder: boolean;
  parent_folders: string[] | null;
}

interface File {
  id: string;
  name: string;
  is_folder: boolean;
  user_id: string;
  parent_folders: string[] | null;
  file_link: FileLink
}

interface FileLink{
    String: string;
    Valid: boolean
}

export default function Dashboard() {
    const [files, setFiles] = useState<File[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [folderName, setFolderName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [currentFolderId, setCurrentFolderId] = useState('');
    const [breadcrumbs, setBreadcrumbs] = useState<{id: string, name: string}[]>([]);
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        fetchAllFolders();
    }, []);

    useEffect(() => {
        fetchFilesInFolder();
    }, [currentFolderId]);

    const fetchAllFolders = () => {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetch(`http://localhost:8080/folders/list`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === "true") {
                setFolders(data.data || []);
            } else {
                console.error('Error fetching folders:', data.message);
            }
        })
        .catch(err => console.error('Error fetching folders:', err));
    };

    const fetchFilesInFolder = () => {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            router.push('/login');
            return;
        }

        const url = currentFolderId 
            ? `http://localhost:8080/files/get?folder_id=${currentFolderId}`
            : `http://localhost:8080/files/get`;

        fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === "true") {
                setFiles(data.data || []);
            } else {
                console.error('Error fetching files:', data.message);
            }
        })
        .catch(err => console.error('Error fetching files:', err));
    };

    const handleFolderClick = (folder: File) => {
        setCurrentFolderId(folder.id);
        
        // Update breadcrumbs
        setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
    };

    const handleBreadcrumbClick = (index: number) => {
        const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
        setBreadcrumbs(newBreadcrumbs);
        
        // Set current folder to the last breadcrumb or empty for root
        setCurrentFolderId(newBreadcrumbs.length > 0 ? newBreadcrumbs[newBreadcrumbs.length - 1].id : '');
    };

    const handleGoBack = () => {
        if (breadcrumbs.length > 0) {
            const newBreadcrumbs = breadcrumbs.slice(0, -1);
            setBreadcrumbs(newBreadcrumbs);
            setCurrentFolderId(newBreadcrumbs.length > 0 ? newBreadcrumbs[newBreadcrumbs.length - 1].id : '');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        router.push('/login');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { 
        const files = e.target.files;
        if (!files || files.length === 0) {
            console.error("No files selected.");
            return;
        }
    
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            router.push('/login');
            return;
        }
    
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);  
        }
    
        if (currentFolderId) {
            formData.append("parent_folder_id", currentFolderId);
        }
    
        try {
            const response = await fetch("http://localhost:8080/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
    
            const data = await response.json();
    
            if (data.status === "true") {
                console.log("Files uploaded successfully:", data.data);
                fetchFilesInFolder();  // Refresh file list after upload
            } else {
                console.error("Error uploading files:", data.message);
            }
        } catch (err) {
            console.error("Upload failed:", err);
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FolderIcon className="w-8 h-8 text-blue-600" />
                        <span>File Manager</span>
                    </h1>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium transition-colors"
                    >
                        <LogOutIcon className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Action Bar */}
                <div className="bg-white shadow-md rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center">
                    {/* Breadcrumbs */}
                    <div className="flex items-center flex-grow overflow-x-auto whitespace-nowrap py-2 text-base">
                        <button 
                            onClick={() => {
                                setBreadcrumbs([]);
                                setCurrentFolderId('');
                            }}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                        >
                            <HomeIcon className="w-5 h-5" />
                            <span>Home</span>
                        </button>
                        
                        {breadcrumbs.map((crumb, idx) => (
                            <div key={idx} className="flex items-center">
                                <span className="mx-2 text-gray-500">/</span>
                                <button 
                                    onClick={() => handleBreadcrumbClick(idx)}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    {crumb.name}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            className="hidden" 
                            multiple 
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <UploadCloudIcon className="w-5 h-5" />
                            Upload
                        </button>
                        <button 
                            onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <FolderPlusIcon className="w-5 h-5" />
                            New Folder
                        </button>
                    </div>
                </div>

               
                {showNewFolderInput && (
                    <div className="bg-white shadow-md rounded-lg p-4 mb-6 flex items-center gap-4">
                        <input
                            type="text"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            placeholder="Enter folder name"
                            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Create
                        </button>
                        <button 
                            onClick={() => setShowNewFolderInput(false)}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">
                            {breadcrumbs.length > 0 
                                ? breadcrumbs[breadcrumbs.length - 1].name 
                                : 'All Files'}
                        </h2>
                    </div>

                    {/* Files and Folders Grid */}
                    <div className="p-6">
                        {files.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <FolderIcon className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No files found</h3>
                                <p className="text-gray-600">This folder is empty</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {/* Folders */}
                                {files.filter(item => item.is_folder).map((folder) => (
                                    <div 
                                        key={folder.id} 
                                        className="cursor-pointer group bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md rounded-lg overflow-hidden transition-all"
                                        onClick={() => handleFolderClick(folder)}
                                    >
                                        <div className="bg-blue-50 p-4 flex justify-center">
                                            <FolderIcon className="w-12 h-12 text-blue-600 group-hover:text-blue-700" />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-medium text-gray-900 truncate">{folder.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">Folder</p>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Files */}
                                {files.filter(item => !item.is_folder).map((file) => (
                                    <div 
                                        key={file.id} 
                                        className="bg-white border border-gray-200 hover:border-green-500 hover:shadow-md rounded-lg overflow-hidden transition-all"
                                    >
                                        <div className="bg-green-50 p-4 flex justify-center">
                                            <FileIcon className="w-12 h-12 text-green-600" />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-medium text-gray-900 truncate">{file.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">File</p>
                                            {/* <p>{file.file_link.Strinx`g}</p> */}
                                            <a href={file.file_link.String} target="_blank" rel="noopener noreferrer">Open File</a>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
