import React, { useRef, useState } from 'react';
import { Upload, File, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  error: string | null;
  fileName: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileUpload, 
  isProcessing,
  error,
  fileName
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'text/csv') {
      onFileUpload(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
          ${isProcessing || (fileName && !error) ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
          disabled={isProcessing}
        />
        
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 size={36} className="text-blue-500 animate-spin mb-3" />
            <p className="text-gray-600 dark:text-gray-400">Processing your file...</p>
          </div>
        ) : fileName && !error ? (
          <div className="flex items-center justify-center space-x-2">
            <File size={36} className="text-blue-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-gray-100">{fileName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload a different file</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <Upload size={24} className="text-blue-500" />
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              Drag & drop your CSV file here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              or click to browse files
            </p>
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              Select CSV File
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;