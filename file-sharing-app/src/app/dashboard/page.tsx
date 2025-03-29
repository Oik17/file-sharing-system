'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FolderIcon, 
  FileIcon, 
  LogOutIcon, 
  UploadCloudIcon, 
  FolderPlusIcon,
  ChevronLeftIcon
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
}

export default function Dashboard() {
    const [files, setFiles] = useState<File[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [folderName, setFolderName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [currentFolderId, setCurrentFolderId] = useState('');
    const [breadcrumbs, setBreadcrumbs] = useState<{id: string, name: string}[]>([]);
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

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
                <div className="p-6">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <FolderIcon className="w-10 h-10 text-blue-500" />
                        Dashboard
                    </h1>
                    
                    {/* Breadcrumbs */}
                    <div className="flex items-center mt-4 text-sm">
                        <button 
                            onClick={() => {
                                setBreadcrumbs([]);
                                setCurrentFolderId('');
                            }}
                            className="text-blue-500 hover:underline"
                        >
                            Home
                        </button>
                        
                        {breadcrumbs.map((crumb, idx) => (
                            <div key={idx} className="flex items-center">
                                <span className="mx-2 text-gray-500">/</span>
                                <button 
                                    onClick={() => handleBreadcrumbClick(idx)}
                                    className="text-blue-500 hover:underline"
                                >
                                    {crumb.name}
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    {breadcrumbs.length > 0 && (
                        <button 
                            onClick={handleGoBack} 
                            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-2"
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                            Back
                        </button>
                    )}
                </div>

                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Files and Folders</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {files.filter(item => item.is_folder).map((folder) => (
                            <div 
                                key={folder.id} 
                                className="cursor-pointer hover:bg-blue-50 p-4 rounded border border-gray-200 flex items-center gap-3"
                                onClick={() => handleFolderClick(folder)}
                            >
                                <FolderIcon className="w-8 h-8 text-blue-500" />
                                <span className="truncate">{folder.name}</span>
                            </div>
                        ))}
                        
                        {files.filter(item => !item.is_folder).map((file) => (
                            <div 
                                key={file.id} 
                                className="p-4 rounded border border-gray-200 flex items-center gap-3"
                            >
                                <FileIcon className="w-8 h-8 text-green-500" />
                                <span className="truncate">{file.name}</span>
                            </div>
                        ))}
                        
                        {files.length === 0 && (
                            <div className="col-span-3 text-center py-8 text-gray-500">
                                No files or folders found in this location
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
