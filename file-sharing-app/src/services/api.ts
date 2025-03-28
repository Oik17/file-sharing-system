// src/services/api.ts
const API_URL = 'http://localhost:8080';

export const uploadFiles = async (formData: FormData, token: string) => {
    const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.json();
};

export const fetchFiles = async (folderId: string, token: string) => {
    const response = await fetch(`${API_URL}/files/get?folder_id=${folderId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.json();
};

export const createFolder = async (folderName: string, parentFolderId: string, token: string) => {
    const formData = new FormData();
    formData.append('folder_name', folderName);
    if (parentFolderId) {
        formData.append('parent_folder_id', parentFolderId);
    }
    
    const response = await fetch(`${API_URL}/files/createFolder`, {
        method: 'POST',
        body: formData,
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.json();
};
