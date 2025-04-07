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

// Utility to format file name
function formatFileName(filename: string): string {
  try {
    const name = decodeURIComponent(filename.split('?')[0] ?? '');
    const parts = name.split('-');

    // Remove UUID-like prefix (first few parts)
    const contentParts = parts.length > 3 ? parts.slice(3) : parts;
    const cleanName = contentParts.join(' ').replace(/\.\w+$/, '');

    return cleanName
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  } catch {
    return filename;
  }
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

  const isImage = fileData?.type?.startsWith('image/') || /\.(jpeg|jpg|gif|png)$/i.test(fileData?.name ?? '');
  const isPdf = fileData?.type === 'application/pdf' || fileData?.name?.toLowerCase().endsWith('.pdf') || false;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f9fafb]">
        <Loader2 className="w-10 h-10 animate-spin text-green-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#fef2f2]">
        <div className="bg-white/90 backdrop-blur-sm border border-red-200 rounded-xl shadow-md p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
          <h2 className="text-xl font-semibold text-red-700 mb-1">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!fileData) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-white p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white/70 backdrop-blur-xl border border-gray-200 shadow-xl overflow-hidden">
        
        {/* File Info Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-200 bg-white/40">
          {renderIcon()}
          <div className="flex flex-col">
            <h2 className="text-md font-semibold text-gray-800 truncate max-w-sm" title={fileData.name}>
              {formatFileName(fileData.name)}
            </h2>
            <p className="text-sm text-gray-500">
              {fileData.type?.split('/').pop()?.toUpperCase() || 'Unknown'} · {(fileData.size ?? 0) / 1024 < 1 ? '<1' : (fileData.size! / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>

        {/* Preview Area */}
        <div className="p-6 bg-white">
          {isImage ? (
            <div className="overflow-hidden rounded-lg border border-gray-300 hover:shadow-lg transition">
              <Image
                src={fileData.url}
                alt={fileData.name}
                width={1200}
                height={800}
                className="max-h-[75vh] w-full object-contain transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(fileData.url)}&embedded=true`}
              className="w-full h-[75vh] rounded-md border"
              title="PDF Preview"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-600">
              <FileIcon className="w-10 h-10 mb-4" />
              <p className="mb-3">Preview not available for this file type.</p>
              <a
                href={fileData.url}
                download={fileData.name}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
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
