/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef } from 'react';
import { Upload, X, Check, RotateCcw, Camera, Sparkles } from 'lucide-react';

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

  const getModeConfig = () => {
    switch (mode) {
      case 'bodytype':
        return {
          title: 'Body Type Analysis',
          icon: '👤',
          gradient: 'from-purple-600 to-pink-600',
          bgGradient: 'from-purple-50 to-pink-50'
        };
      case 'color':
        return {
          title: 'Color Analysis',
          icon: '🎨',
          gradient: 'from-blue-600 to-teal-600',
          bgGradient: 'from-blue-50 to-teal-50'
        };
      case 'wardrobe':
      default:
        return {
          title: 'Add Wardrobe Item',
          icon: '👕',
          gradient: 'from-indigo-600 to-purple-600',
          bgGradient: 'from-indigo-50 to-purple-50'
        };
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

  const modeConfig = getModeConfig();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4">
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/50">
          {/* Header */}
          <div className={`bg-gradient-to-r ${modeConfig.gradient} p-6`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{modeConfig.icon}</div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {modeConfig.title}
                  </h3>
                  <p className="text-white/80 text-sm mt-1">{getInstructions()}</p>
                </div>
              </div>
              <button
                onClick={onCancel}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          {/* Image Area */}
          <div className="relative aspect-video bg-gradient-to-br from-gray-50 to-gray-100">
            {selectedImage ? (
              <div className="relative w-full h-full">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
              </div>
            ) : (
              <div
                className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed transition-all duration-300 ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 scale-105'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className={`p-6 rounded-2xl bg-gradient-to-br ${modeConfig.bgGradient} mb-6`}>
                  <Upload className="h-16 w-16 text-gray-600" />
                </div>
                
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-700 mb-2">
                      Drop your image here
                    </p>
                    <p className="text-gray-500">or click the button below to browse</p>
                  </div>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`group relative inline-flex items-center space-x-3 bg-gradient-to-r ${modeConfig.gradient} hover:shadow-xl text-white px-8 py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
                  >
                    <Camera className="h-5 w-5" />
                    <span>Choose File</span>
                    <div className={`absolute inset-0 bg-gradient-to-r ${modeConfig.gradient} rounded-2xl blur opacity-50 -z-10 group-hover:opacity-70 transition-opacity`}></div>
                  </button>
                </div>
                
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

          {/* Footer */}
          <div className="p-6 bg-white/80 backdrop-blur-sm">
            {selectedImage ? (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={retake}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span>Choose Different</span>
                </button>
                <button
                  onClick={confirm}
                  className={`group relative flex items-center space-x-2 px-8 py-3 bg-gradient-to-r ${modeConfig.gradient} hover:shadow-xl text-white rounded-2xl font-semibold transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <Check className="h-5 w-5" />
                  <span>Use Photo</span>
                  <Sparkles className="h-4 w-4 opacity-70" />
                  <div className={`absolute inset-0 bg-gradient-to-r ${modeConfig.gradient} rounded-2xl blur opacity-50 -z-10 group-hover:opacity-70 transition-opacity`}></div>
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-500 text-sm">
                  Supported formats: JPG, PNG, GIF (max 10MB)
                </p>
                <div className="flex justify-center items-center space-x-4 mt-3 text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Secure upload</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>AI-powered analysis</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload; 