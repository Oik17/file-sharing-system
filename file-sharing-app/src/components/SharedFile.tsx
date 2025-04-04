'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FileIcon } from 'lucide-react';

interface SharedFileProps {
  code: string;
}

interface FileResponse {
  url: string;
  name: string;
  type?: string;
  size?: number;
}

export default function SharedFile({ code }: SharedFileProps) {
  const [fileData, setFileData] = useState<FileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFile() {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/files/getByCode?code=${code}`);

        if (!response.ok) {
          throw new Error(response.status === 404 ? 'File not found' : 'Failed to fetch file');
        }

        const raw = await response.json();
        const url = raw.data;

        const nameFromUrl = url.split('/').pop()?.split('?')[0] ?? 'file';
        const extension = nameFromUrl.split('.').pop()?.toLowerCase();

        const type =
          extension?.startsWith('jp') ? 'image/jpeg' :
          extension === 'png' ? 'image/png' :
          extension === 'gif' ? 'image/gif' :
          extension === 'pdf' ? 'application/pdf' :
          undefined;

        setFileData({
          url,
          name: nameFromUrl,
          type,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchFile();
  }, [code]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-medium text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!fileData) return null;

  const isImage = fileData.type?.startsWith('image/') || /\.(jpeg|jpg|gif|png)$/i.test(fileData.name ?? '');
  const isPdf = fileData.type === 'application/pdf' || fileData.name?.toLowerCase().endsWith('.pdf') || false;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-md max-w-4xl w-full">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-800">{fileData.name}</h1>
        </div>

        <div className="p-6">
          {isImage ? (
            <div className="flex justify-center">
              <Image
                src={fileData.url}
                alt={fileData.name}
                width={800}
                height={600}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
          ) : isPdf ? (
            <iframe
  src={`https://docs.google.com/gview?url=${encodeURIComponent(fileData.url)}&embedded=true`}
  className="w-full h-[70vh] border rounded-md"
  title="PDF Preview via Google Viewer"
/>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <FileIcon className="w-16 h-16 text-green-600 mb-4" />
              <p className="mb-4 text-gray-700">This file type cannot be previewed</p>
              <a
                href={fileData.url}
                download={fileData.name}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
