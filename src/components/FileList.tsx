// src/components/FileList.tsx
import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api'; // Adjust path as needed
import FileListItem, { ConvexFile } from './FileListItem'; // Assuming FileListItem is created and ConvexFile is exported
import { Loader2, FolderOpen } from 'lucide-react'; // Loading spinner and empty folder icon

const FileList = () => {
  // Fetch files using the Convex query.
  // Note: `files` will be `undefined` on initial load, then an array or null.
  const files = useQuery(api.files.getFilesForUser);
  const isAuthenticated = useQuery(api.auth.getCurrentUser) !== null; // Basic check

  // Loading state: files is undefined
  if (files === undefined) {
    return (
      <div className="flex flex-col justify-center items-center p-8 text-gray-500">
        <Loader2 size={32} className="animate-spin text-blue-600" />
        <p className="ml-2 mt-2">Loading files...</p>
      </div>
    );
  }

  // Not authenticated state (if files is empty and user is not authenticated, could be because of that)
  // This is a basic check. A more robust auth check might be needed depending on app structure.
  if (!isAuthenticated && (!files || files.length === 0)) {
     return (
        <div className="text-center text-gray-500 py-10">
          <p>Please log in to view your files.</p>
        </div>
     );
  }

  // Empty state: files is an empty array or null, and user is authenticated
  if (!files || files.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        <FolderOpen size={48} className="mx-auto mb-3 text-gray-400" />
        <p className="text-lg">No files uploaded yet.</p>
        <p className="text-sm">Use the uploader above to add your first file.</p>
      </div>
    );
  }

  // Success state: files array has items
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Your Files</h3>
      <div className="space-y-1"> {/* Provides spacing between items if any margin is removed from FileListItem itself */}
        {files.map((file) => (
          // Pass the file object, ensuring it matches ConvexFile type.
          // The `as any` was in the prompt, but we can try to use the defined interface.
          <FileListItem key={file._id} file={file as ConvexFile} />
        ))}
      </div>
    </div>
  );
};

export default FileList;
