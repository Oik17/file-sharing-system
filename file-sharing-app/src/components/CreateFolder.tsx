// src/components/CreateFolder.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createFolder } from '../services/api';

interface CreateFolderProps {
    currentFolder: string;
    onFolderCreated: () => void;
}

const CreateFolder: React.FC<CreateFolderProps> = ({ currentFolder, onFolderCreated }) => {
    const { user } = useAuth();
    const [folderName, setFolderName] = useState('');
    const [creating, setCreating] = useState(false);

    const handleCreateFolder = async () => {
        if (!folderName.trim() || !user) return;

        setCreating(true);
        try {
            const response = await createFolder(folderName, currentFolder, user.token);
            if (response.status === "true") {
                setFolderName('');
                if (onFolderCreated) {
                    onFolderCreated();
                }
            } else {
                console.error('Error creating folder:', response.message);
            }
        } catch (error) {
            console.error('Error creating folder:', error);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">Create New Folder</h2>
            <div className="flex space-x-2">
                <input 
                    type="text" 
                    value={folderName} 
                    onChange={(e) => setFolderName(e.target.value)} 
                    placeholder="Folder Name" 
                    className="flex-1 border border-gray-300 p-2 rounded"
                    disabled={creating}
                />
                <button 
                    onClick={handleCreateFolder} 
                    disabled={!folderName.trim() || creating}
                    className={`py-2 px-4 rounded ${
                        !folderName.trim() || creating 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                >
                    {creating ? 'Creating...' : 'Create'}
                </button>
            </div>
        </div>
    );
};

export default CreateFolder;
