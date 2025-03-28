// src/components/FileList.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchFiles } from '../services/api';

interface File {
    id: string;
    name: string;
    is_folder: boolean;
    parent_folders: string[];
}

interface FileListProps {
    onFolderChange: (folderId: string) => void;
}

const FileList: React.FC<FileListProps> = ({ onFolderChange }) => {
    const { user } = useAuth();
    const [files, setFiles] = useState<File[]>([]);
    const [currentFolder, setCurrentFolder] = useState('');
    const [folderPath, setFolderPath] = useState<{id: string, name: string}[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            loadFiles();
        }
    }, [currentFolder, user]);

    useEffect(() => {
        onFolderChange(currentFolder);
    }, [currentFolder, onFolderChange]);

    const loadFiles = async () => {
        if (!user) return;
        
        setLoading(true);
        try {
            const response = await fetchFiles(currentFolder, user.token);
            if (response.status === true || response.status === "true") {
                setFiles(response.data);
            } else {
                console.error('Error fetching files:', response.message);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFolderClick = (folder: File) => {
        setCurrentFolder(folder.id);
        setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
    };

    const navigateToFolder = (index: number) => {
        if (index === -1) {
            setCurrentFolder('');
            setFolderPath([]);
        } else {
            const newPath = folderPath.slice(0, index + 1);
            setFolderPath(newPath);
            setCurrentFolder(newPath[newPath.length - 1].id);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Files & Folders</h2>
            
            <div className="flex items-center mb-4 text-sm overflow-x-auto">
                <button 
                    onClick={() => navigateToFolder(-1)}
                    className="text-blue-500 hover:text-blue-700 flex-shrink-0"
                >
                    Home
                </button>
                {folderPath.map((folder, index) => (
                    <div key={folder.id} className="flex items-center flex-shrink-0">
                        <span className="mx-2">/</span>
                        <button 
                            onClick={() => navigateToFolder(index)}
                            className="text-blue-500 hover:text-blue-700 truncate max-w-xs"
                        >
                            {folder.name}
                        </button>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : files.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>No files or folders found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {files.map((file) => (
                        <div 
                            key={file.id} 
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            {file.is_folder ? (
                                <button 
                                    onClick={() => handleFolderClick(file)}
                                    className="w-full text-left flex items-center"
                                >
                                    <svg className="w-6 h-6 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                                    </svg>
                                    <span className="truncate">{file.name}</span>
                                </button>
                            ) : (
                                <div className="flex items-center">
                                    <svg className="w-6 h-6 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path>
                                    </svg>
                                    <span className="truncate">{file.name}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileList;
