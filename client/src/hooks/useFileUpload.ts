import { useState } from 'react';
import { useGetStudentUploadUrlMutation } from '@/state/api';
import { toast } from 'sonner';

// Define file types
export interface FileWithPreview extends File {
  id: string;
  preview?: string;
  uploadStatus: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  fileUrl?: string;
}

export const useFileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [getUploadUrl] = useGetStudentUploadUrlMutation();
  
  // Handle file selection
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    fileInputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        ...file,
        id: crypto.randomUUID(),
        preview: URL.createObjectURL(file),
        uploadStatus: 'pending' as const,
        progress: 0
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
    
    // Reset input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Remove file from the list
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };
  
  // Clear all files
  const clearFiles = () => {
    setUploadedFiles([]);
  };
  
  // Upload multiple files
  const uploadFiles = async (): Promise<string[]> => {
    if (uploadedFiles.length === 0) {
      return [];
    }
    
    setIsUploading(true);
    const fileUrls: string[] = [];
    let hasUploadErrors = false;
    
    try {
      // Update all files to uploading state
      setUploadedFiles(prev => prev.map(file => ({
        ...file,
        uploadStatus: 'uploading',
        progress: 0
      })));
      
      // Process uploads sequentially
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        
        try {
          // Update progress
          setUploadedFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { ...f, progress: 10 } 
              : f
          ));
          
          // Get presigned URL from server
          const response = await getUploadUrl({
            fileName: file.name,
            fileType: file.type
          }).unwrap();
          
          // Update progress
          setUploadedFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { ...f, progress: 40 } 
              : f
          ));
          
          // Upload to S3 using the presigned URL
          await fetch(response.uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type
            }
          });
          
          // Update progress and status
          setUploadedFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { 
                  ...f, 
                  progress: 100, 
                  uploadStatus: 'success',
                  fileUrl: response.fileUrl
                } 
              : f
          ));
          
          // Add the file URL to our collection
          fileUrls.push(response.fileUrl);
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          
          // Update status to error
          setUploadedFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { ...f, uploadStatus: 'error', progress: 0 } 
              : f
          ));
          
          hasUploadErrors = true;
        }
      }
      
      if (hasUploadErrors) {
        toast.error("Some files failed to upload. Please try again or remove them.", {
          duration: 5000
        });
      }
      
      return fileUrls;
    } catch (error) {
      console.error("Error during file upload:", error);
      toast.error("An error occurred during upload. Please try again.");
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadedFiles,
    isUploading,
    handleFileChange,
    removeFile,
    clearFiles,
    uploadFiles
  };
};

export default useFileUpload; 