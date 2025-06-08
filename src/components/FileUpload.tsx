// src/components/FileUpload.tsx
import React, { useState, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api'; // Adjust path as needed
import { UploadCloud, File as FileIcon, X } from 'lucide-react'; // Icons
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .doc, .docx
  'text/plain', // .txt
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xls, .xlsx
];
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  // const [error, setError] = useState<string | null>(null); // Replaced by toasts
  const [dragActive, setDragActive] = useState<boolean>(false);
  const { t } = useTranslation();

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFileMetadata = useMutation(api.files.saveFile);

  const handleFileChange = (file: File | null) => {
    // setError(null); // No longer needed
    if (file) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        toast.error(t('fileUpload.errorFileType'));
        setSelectedFile(null);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(t('fileUpload.errorFileSize', { maxSize: MAX_FILE_SIZE_MB }));
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFileChange(event.dataTransfer.files[0]);
    }
  }, []);

  const handleDragActivity = useCallback((event: React.DragEvent<HTMLDivElement>, type: 'over' | 'leave' | 'enter') => {
    event.preventDefault();
    event.stopPropagation();
    if (type === 'enter' || type === 'over') {
      setDragActive(true);
    } else if (type === 'leave') {
      setDragActive(false);
    }
  }, []);

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error(t('fileUpload.errorNoFile'));
      return;
    }
    setIsUploading(true);
    // setError(null); // No longer needed
    setUploadProgress(50); // Simulate progress start

    try {
      const postUrl = await generateUploadUrl();

      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      if (!result.ok) {
         const errorBody = await result.text();
         throw new Error(`Upload failed: ${result.statusText} - ${errorBody}`);
      }

      const { storageId } = await result.json();

      await saveFileMetadata({
        storageId,
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
      });

      setUploadProgress(100); // Simulate progress end
      setSelectedFile(null);
      toast.success(t('fileUpload.successUpload'));
    } catch (err: any) {
      toast.error(t('fileUpload.errorUpload', { message: err.message }));
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
      // Reset progress a bit later for user to see 100%
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => handleDragActivity(e, 'over')}
          onDragEnter={(e) => handleDragActivity(e, 'enter')}
          onDragLeave={(e) => handleDragActivity(e, 'leave')}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                      ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <input
            type="file"
            id="fileInput"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
            accept={ALLOWED_MIME_TYPES.join(',')}
          />
          <UploadCloud size={48} className="mx-auto text-gray-400 mb-2" />
          {dragActive ? (
            <p>{t('fileUpload.dropzoneDragActive')}</p>
          ) : (
            <p>{t('fileUpload.dropzoneDefault')}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">{t('fileUpload.maxSizeAndTypes')}</p>
        </div>

        {selectedFile && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <FileIcon size={24} className="text-gray-600 mr-2" />
              <div>
                <p className="text-sm font-medium truncate max-w-xs">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                 {t('fileUpload.selectedFileDetails', { size: (selectedFile.size / 1024 / 1024).toFixed(2), type: selectedFile.type })}
                </p>
              </div>
            </div>
           <button type="button" onClick={() => {setSelectedFile(null); /* setError(null); No longer needed */}} className="text-red-500 hover:text-red-700">
              <X size={20} />
            </button>
          </div>
        )}

        {isUploading && (
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}

        {/* {error && <p className="mt-2 text-sm text-red-600">{error}</p>}  This line was already removed/commented in a previous step by me, but good to ensure it's gone */}

        <button
          type="submit"
          disabled={!selectedFile || isUploading}
          className="mt-6 w-full px-4 py-2 text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg disabled:bg-gray-400 disabled:hover:bg-gray-400 transition-colors duration-150"
        >
          {isUploading ? t('fileUpload.uploadingButton') : t('fileUpload.uploadButton')}
        </button>
      </form>
    </div>
  );
};
export default FileUpload;
