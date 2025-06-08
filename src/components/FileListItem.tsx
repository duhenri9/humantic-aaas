// src/components/FileListItem.tsx
import React from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api'; // Adjust path as needed
import { FileText, Download, Trash2, Image, FileArchive, FileType, Film, Music, AlertTriangle } from 'lucide-react'; // More icons
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// Helper to get a representative icon
const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return <Image size={24} className="text-purple-500" />;
  if (mimeType.startsWith('video/')) return <Film size={24} className="text-orange-500" />;
  if (mimeType.startsWith('audio/')) return <Music size={24} className="text-pink-500" />;
  if (mimeType === 'application/pdf') return <FileText size={24} className="text-red-500" />;
  if (mimeType.includes('word')) return <FileType size={24} className="text-blue-700" />;
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileType size={24} className="text-green-700" />;
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return <FileType size={24} className="text-yellow-600" />;
  if (mimeType === 'text/plain') return <FileText size={24} className="text-gray-700" />;
  return <FileArchive size={24} className="text-gray-500" />; // Default
};

// Define the expected shape of the file object based on Convex query results
export interface ConvexFile {
  _id: any; // Convex Id type e.g. Id<"files">
  _creationTime: number;
  name: string;
  type: string; // Mime type
  size: number;
  storageId: string;
  userId: any; // Convex Id type e.g. Id<"users">
  // Add any other fields that your `getFilesForUser` query returns
}

interface FileListItemProps {
  file: ConvexFile;
}

const FileListItem: React.FC<FileListItemProps> = ({ file }) => {
  const deleteFileMutation = useMutation(api.files.deleteFile);
  const getFileUrl = useQuery(api.files.getFileDownloadUrl, { storageId: file.storageId });
  const { t } = useTranslation();

  const [isDeleting, setIsDeleting] = React.useState(false);
  const [downloadError, setDownloadError] = React.useState<string | null>(null);

  const handleDelete = async () => {
    if (window.confirm(t('fileList.confirmDelete', { fileName: file.name }))) {
      setIsDeleting(true);
      try {
        await deleteFileMutation({ fileId: file._id, storageId: file.storageId });
        toast.success(`"${file.name}" ${t('general.deletedSuccessfully', 'deleted successfully')}`);
        // List should refresh automatically due to useQuery in parent FileList
      } catch (err: any) {
        console.error("Error deleting file:", err);
        toast.error(`${t('general.errorDeleting', 'Error deleting file')}: ${err.message}`);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDownloadClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!getFileUrl) {
      event.preventDefault();
      setDownloadError("Download URL is not available yet. Please try again shortly.");
      // Optionally, attempt to fetch the URL again here if it was conditional
      // For now, we rely on useQuery to provide it.
      console.warn("Download link clicked but URL not ready for file:", file.name);
    } else {
      setDownloadError(null); // Clear any previous error
    }
  };


  return (
    <div className={`flex items-center justify-between p-3 my-2 bg-white rounded-lg shadow transition-opacity duration-300 ${isDeleting ? 'opacity-50' : 'opacity-100'}`}>
      <div className="flex items-center space-x-3 overflow-hidden"> {/* Added overflow-hidden */}
        {getFileIcon(file.type)}
        <div className="truncate"> {/* Added truncate here for text */}
          <p className="text-sm font-medium text-gray-800 truncate" title={file.name}>{file.name}</p>
          <p className="text-xs text-gray-500">
            {(file.size / 1024 / 1024).toFixed(2)} MB - {new Date(file._creationTime).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0 space-x-1 sm:space-x-2"> {/* Added flex-shrink-0 */}
        <a
          href={getFileUrl || '#'}
          download={file.name}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2 text-gray-600 hover:text-blue-600 ${!getFileUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={getFileUrl ? "Download file" : "Download URL not ready"}
          onClick={handleDownloadClick}
          aria-disabled={!getFileUrl}
        >
          <Download size={18} />
        </a>
        <button
          onClick={handleDelete}
          className="p-2 text-gray-600 hover:text-red-600 disabled:opacity-50"
          title="Delete file"
          disabled={isDeleting}
        >
          <Trash2 size={18} />
        </button>
      </div>
      {downloadError && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50 flex items-center">
          <AlertTriangle size={20} className="mr-2" />
          <span>{downloadError}</span>
          <button onClick={() => setDownloadError(null)} className="ml-4 text-red-700 font-bold">OK</button>
        </div>
      )}
    </div>
  );
};

export default FileListItem;
