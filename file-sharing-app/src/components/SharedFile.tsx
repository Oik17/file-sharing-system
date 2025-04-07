'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FileIcon, ImageIcon, FileTextIcon, Loader2, AlertTriangle } from 'lucide-react';

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
        const response = await fetch(`https://file-be.akshat-gupta.com/files/getByCode?code=${code}`);
        if (!response.ok) throw new Error(response.status === 404 ? 'File not found' : 'Failed to fetch file');

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

        setFileData({ url, name: nameFromUrl, type });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchFile();
  }, [code]);

  const renderIcon = () => {
    if (!fileData) return <FileIcon className="w-6 h-6 text-gray-500" />;
    if (fileData.type?.startsWith('image/')) return <ImageIcon className="w-6 h-6 text-green-600" />;
    if (fileData.type === 'application/pdf') return <FileTextIcon className="w-6 h-6 text-red-600" />;
    return <FileIcon className="w-6 h-6 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-green-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!fileData) return null;

  const isImage = fileData.type?.startsWith('image/') || /\.(jpeg|jpg|gif|png)$/i.test(fileData.name ?? '');
  const isPdf = fileData.type === 'application/pdf' || fileData.name?.toLowerCase().endsWith('.pdf') || false;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg max-w-4xl w-full overflow-hidden">
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          {renderIcon()}
          <div className="flex flex-col">
            <h1 className="text-lg font-medium text-gray-800 truncate max-w-md" title={fileData.name}>
              {fileData.name}
            </h1>
            <p className="text-sm text-gray-500">
              {fileData.type?.split('/').pop()?.toUpperCase() || 'Unknown'}
              {fileData.size ? ` • ${(fileData.size / 1024).toFixed(1)} KB` : ''}
            </p>
          </div>
        </div>

        <div className="p-6">
          {isImage ? (
            <div className="flex justify-center">
              <Image
                src={fileData.url}
                alt={fileData.name}
                width={800}
                height={600}
                className="max-h-[70vh] w-auto object-contain rounded-md border"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(fileData.url)}&embedded=true`}
              className="w-full h-[70vh] border rounded-md"
              title="PDF Preview"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <FileIcon className="w-12 h-12 text-gray-400 mb-4" />
              <p className="mb-3 text-gray-700">Preview not available</p>
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
