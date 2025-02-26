import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

interface FileUploadZoneProps {
  files: File[];
  onChange: (files: File[]) => void;
}

export const FileUploadZone = ({ files, onChange }: FileUploadZoneProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onChange([...files, ...acceptedFiles]);
  }, [files, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onChange(newFiles);
  };

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className="file-upload-zone">
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <p>Drag & drop files here, or click to select files</p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          Supports: PDF, DOC, DOCX, JPG, PNG
        </p>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <span className="text-sm truncate">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};