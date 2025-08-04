/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef } from 'react';
import { Upload, X, Check, RotateCcw } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (imageSrc: string) => void;
  onCancel: () => void;
  mode?: 'wardrobe' | 'bodytype' | 'color';
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  onCancel,
  mode = 'wardrobe',
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragleave' || e.type === 'dragover') {
      setDragActive(e.type !== 'dragleave');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const getInstructions = () => {
    switch (mode) {
      case 'bodytype':
        return 'Upload a full-body photo in good lighting for body type analysis';
      case 'color':
        return 'Upload a clear photo of your face in natural lighting for color analysis';
      case 'wardrobe':
      default:
        return 'Upload a clear photo of the clothing item';
    }
  };

  const confirm = () => {
    if (selectedImage) {
      onUpload(selectedImage);
    }
  };

  const retake = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
      <div className="w-full max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {mode === 'bodytype'
                  ? 'Body Type Analysis'
                  : mode === 'color'
                  ? 'Color Analysis'
                  : 'Add Wardrobe Item'}
              </h3>
              <button
                onClick={onCancel}
                className="p-2 hover:bg-gray-200 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">{getInstructions()}</p>
          </div>

          <div className="relative aspect-video bg-gray-100">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Selected"
                className="w-full h-full object-contain"
              />
            ) : (
              <div
                className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-600 mb-2">
                  Drop your image here
                </p>
                <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Choose File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50">
            {selectedImage ? (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={retake}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Choose Different</span>
                </button>
                <button
                  onClick={confirm}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Check className="h-4 w-4" />
                  <span>Use Photo</span>
                </button>
              </div>
            ) : (
              <p className="text-center text-sm text-gray-500">
                Supported formats: JPG, PNG, GIF (max 10MB)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload; 