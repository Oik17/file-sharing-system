// src/components/FileUpload.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadFiles } from '../services/api';

interface FileUploadProps {
    currentFolder: string;
    onUploadComplete: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ currentFolder, onUploadComplete }) => {
    const { user } = useAuth();
    const [files, setFiles] = useState<FileList | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFiles(event.target.files);
    };

    const handleUpload = async () => {
        if (!files || !user) return;

        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }
        
        if (currentFolder) {
            formData.append('parent_folder_id', currentFolder);
        }

        try {
            const response = await uploadFiles(formData, user.token);
            if (response.status === "true") {
                setFiles(null);
                if (onUploadComplete) {
                    onUploadComplete();
                }
            } else {
                console.error('Error uploading files:', response.message);
            }
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">Upload Files</h2>
            <div className="flex flex-col space-y-4">
                <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange} 
                    className="border border-gray-300 p-2 rounded"
                    disabled={uploading}
                />
                
                {uploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                )}
                
                <button 
                    onClick={handleUpload} 
                    disabled={!files || uploading}
                    className={`py-2 px-4 rounded ${
                        !files || uploading 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                >
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
            </div>
        </div>
    );
};

export default FileUpload;
