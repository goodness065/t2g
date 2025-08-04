/* eslint-disable @next/next/no-img-element */
"use client"
import { 
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import { useState } from "react";
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Send, 
  X, 
  Download, 
  Sparkles, 
  Brain, 
  MessageCircle,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

type UploadedFile = {
  type: 'image';
  uri: string;
  mimeType: string;
} | {
  type: 'pdf';
  data: string;
  mimeType: string;
  name: string;
};

export default function Docs() {
  const [question, setQuestion] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [generatedVideo, setGeneratedVideo] = useState<{uri: string, blob?: Blob} | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<{data: string, url?: string} | null>(null);

  const ai = new GoogleGenAI({
    apiKey: 'AIzaSyCanEPvdR9XIPZWxfhg2Ko2DOA5XVs6qS0'
  });

  // Convert file to base64
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    if (!isImage && !isPDF) {
      setError("Please select an image file or PDF document");
      return;
    }

    setPreviewFile(file);
    setError("");
    
    try {
      if (isImage) {
        const uploadedFile = await ai.files.upload({
          file: file,
        });

        setUploadedFile({
          type: 'image',
          uri: uploadedFile.uri || '',
          mimeType: uploadedFile.mimeType || ''
        });
      } else if (isPDF) {
        const base64Data = await fileToBase64(file);
        
        setUploadedFile({
          type: 'pdf',
          data: base64Data,
          mimeType: file.type,
          name: file.name
        });
      }
    } catch (err) {
      setError(`File upload failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  function downloadImage(imageData: string, filename: string) {
    const byteCharacters = atob(imageData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!question.trim()) {
      setError("Please enter a question or prompt");
      return;
    }

    setLoading(true);
    setError("");
    setResponse("");
    setGeneratedImages([]);
    setGeneratedVideo(null);
    setGeneratedAudio(null);

    try {
      // Chat mode - handle both text, images, and PDFs
      let contents;
      
      if (uploadedFile) {
        if (uploadedFile.type === 'image') {
          contents = [
            createUserContent([
              question,
              createPartFromUri(uploadedFile.uri, uploadedFile.mimeType),
            ]),
          ];
        } else if (uploadedFile.type === 'pdf') {
          contents = [
            { text: question },
            {
              inlineData: {
                mimeType: uploadedFile.mimeType,
                data: uploadedFile.data
              }
            }
          ];
        }
      } else {
        contents = question;
      }

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        // @ts-expect-error - contents is not typed
        contents: contents ,
      });

      setResponse(result.text || "No response received");

    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function clearFile() {
    setUploadedFile(null);
    setPreviewFile(null);
    if (document.getElementById('file-input')) {
      (document.getElementById('file-input') as HTMLInputElement).value = '';
    }
  }

  return (
    <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className=" space-y-8">
        {/* Left Column - Input */}
        <div className=" space-y-8">
          {/* File Upload Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Upload & Analyze</h3>
                <p className="text-gray-600">Upload documents or images for AI analysis</p>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 hover:border-blue-400 transition-colors duration-300">
              <div className="text-center">
                <div className="mb-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl inline-block">
                    <FileText className="h-12 w-12 text-blue-600" />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Choose a file to analyze</h4>
                <p className="text-gray-600 mb-6">
                  Upload images (JPG, PNG) or PDF documents for AI-powered analysis
                </p>
                
                <div className="flex items-center justify-center">
                  <label className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <Upload className="h-5 w-5" />
                    <span>Choose File</span>
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-50 -z-10 group-hover:opacity-70 transition-opacity"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* File Preview */}
            {previewFile && (
              <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">File Preview</h4>
                  <button
                    onClick={clearFile}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {previewFile.type.startsWith('image/') ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(previewFile)}
                      alt="Preview"
                      className="max-w-full max-h-64 object-contain rounded-xl shadow-lg border border-gray-200"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-200">
                    <div className="p-3 bg-red-100 rounded-xl">
                      <FileText className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{previewFile.name}</p>
                      <p className="text-gray-600 text-sm">
                        PDF Document • {(previewFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                )}
                
                {uploadedFile && (
                  <div className="mt-4 flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">
                      {uploadedFile.type === 'pdf' ? 'PDF' : 'Image'} uploaded successfully
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* PDF Processing Info */}
            {uploadedFile?.type === 'pdf' && (
              <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-bold text-blue-900">PDF Ready for Analysis</h4>
                </div>
                <p className="text-blue-800 mb-4">
                  Your PDF has been processed and is ready for AI analysis. Try asking:
                </p>
                <div className="grid md:grid-cols-2 gap-2">
                  {[
                    "Summarize this document",
                    "What are the key points?",
                    "Extract main conclusions",
                    "Translate to another language"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setQuestion(suggestion)}
                      className="text-left p-3 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-xl transition-colors text-sm font-medium"
                    >
                      &quot;{suggestion}&quot;
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>


          {/* Question Form */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Ask Your Question</h3>
                <p className="text-gray-600">Get intelligent responses powered by AI</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="relative mb-6">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={
                    uploadedFile?.type === 'pdf'
                      ? "Ask anything about your PDF document..."
                      : uploadedFile?.type === 'image'
                      ? "What would you like to know about this image..." 
                      : "Ask me anything or upload a file to analyze..."
                  }
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 resize-none transition-all duration-300 text-lg min-h-[120px]"
                  disabled={loading}
                />
                <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                  {uploadedFile && (
                    <div className="flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {uploadedFile.type === 'pdf' ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                      <span>{uploadedFile.type === 'pdf' ? 'PDF' : 'Image'} attached</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className={question.length > 950 ? 'text-red-600 font-medium' : ''}>
                    {question.length} / 1000 characters
                  </span>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Loader className="h-6 w-6 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-6 w-6" />
                      <span>Ask AI</span>
                      <Sparkles className="h-5 w-5 opacity-70" />
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-50 -z-10 group-hover:opacity-70 transition-opacity"></div>
                </button>
              </div>
            </form>
          </div>

          
        </div>

        {/* Right Column - Results */}
        <div className="space-y-8">
          {/* Loading State */}
          {loading && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 text-center">
              <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl inline-block mb-6">
                <Loader className="h-12 w-12 text-purple-600 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI is thinking...</h3>
              <p className="text-gray-600">
                {uploadedFile?.type === 'pdf' ? "Analyzing your document..." 
                 : uploadedFile?.type === 'image' ? "Understanding your image..."
                 : "Processing your question..."}
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-3xl p-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-red-100 rounded-2xl">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-800">Error</h3>
                  <p className="text-red-600 text-sm">Something went wrong</p>
                </div>
              </div>
              <p className="text-red-700 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Response Display */}
          {response && !loading && (
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">AI Response</h3>
                  <p className="text-gray-600">Analysis complete</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">{response}</p>
              </div>
            </div>
          )}

          {/* Generated Images */}
          {generatedImages.length > 0 && (
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-pink-600 to-purple-600 rounded-2xl shadow-lg">
                  <ImageIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Generated Images</h3>
                  <p className="text-gray-600">{generatedImages.length} image(s) created</p>
                </div>
              </div>
              
              <div className="grid gap-6">
                {generatedImages.map((imageData, index) => (
                  <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                    <img
                      src={`data:image/png;base64,${imageData}`}
                      alt={`Generated image ${index + 1}`}
                      className="w-full max-h-96 object-contain rounded-xl shadow-lg mb-4"
                    />
                    <button
                      onClick={() => downloadImage(imageData, `generated-image-${index + 1}.png`)}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                    >
                      <Download className="h-5 w-5" />
                      <span>Download Image</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!response && !loading && !error && generatedImages.length === 0 && !generatedVideo && !generatedAudio && (
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 text-center">
              <div className="p-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl inline-block mb-6">
                <Brain className="h-16 w-16 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Assist</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Upload a document or image and ask questions, or simply start a conversation with our AI assistant.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-purple-600">
                  <FileText className="h-4 w-4" />
                  <span>PDF Analysis</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-600">
                  <ImageIcon className="h-4 w-4" />
                  <span>Image Understanding</span>
                </div>
                <div className="flex items-center space-x-2 text-green-600">
                  <MessageCircle className="h-4 w-4" />
                  <span>Smart Conversation</span>
                </div>
                <div className="flex items-center space-x-2 text-orange-600">
                  <Sparkles className="h-4 w-4" />
                  <span>Creative Analysis</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
