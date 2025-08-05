/* eslint-disable @next/next/no-img-element */
"use client"
import { 
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import { useState } from "react";


type Mode = 'chat' | 'image' | 'video' | 'audio';
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
  const [mode] = useState<Mode>('chat');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [generatedVideo, setGeneratedVideo] = useState<{uri: string, blob?: Blob} | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<{data: string, url?: string} | null>(null);
  const [videoProgress, setVideoProgress] = useState<string>("");

  const ai = new GoogleGenAI({
    apiKey: 'AIzaSyCanEPvdR9XIPZWxfhg2Ko2DOA5XVs6qS0'
  });

  // Available voices for TTS
  // const voices = [
  //   'Kore', 'Charon', 'Fenrir', 'Aoede', 'Puck'
  // ];

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

//   async function downloadVideoFile(videoUri: string, filename: string) {
//     try {
//       setVideoProgress("Preparing download...");
      
//       const fileId = videoUri.split('/files/')[1]?.split(':')[0];
      
//       if (!fileId) {
//         throw new Error("Invalid video URI format");
//       }

//       const downloadUrl = `https://generativelanguage.googleapis.com/v1beta/files/${fileId}?alt=media`;
      
//       const response = await fetch(downloadUrl, {
//         headers: {
//           'X-Goog-Api-Key': ai.apiKey || '',
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       const blob = await response.blob();
      
//       const url = URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = filename;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(url);
      
//       setVideoProgress("");
//     } catch (err) {
//       console.error('Download error:', err);
//       setError(`Video download failed: ${err instanceof Error ? err.message : "Unknown error"}`);
//       setVideoProgress("");
//     }
//   }

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
    setVideoProgress("");

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
      setVideoProgress("");
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">AI Assistant</h1>
      


      {/* File Upload Section - only show in chat mode */}
      {mode === 'chat' && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Upload File (Optional)</h2>
          <p className="text-sm text-gray-600 mb-3">
            Upload an image (JPG, PNG, etc.) or PDF document to analyze and ask questions about.
          </p>
          <div className="flex items-center gap-4">
            <input
              id="file-input"
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploadedFile && (
              <button
                onClick={clearFile}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Clear
              </button>
            )}
          </div>
          
          {previewFile && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              {previewFile.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(previewFile)}
                  alt="Preview"
                  className="max-w-xs max-h-48 object-contain border rounded"
                />
              ) : (
                <div className="p-4 border rounded bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">📄</div>
                    <div>
                      <p className="font-medium">{previewFile.name}</p>
                      <p className="text-sm text-gray-500">
                        PDF Document ({(previewFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {uploadedFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {uploadedFile.type === 'pdf' ? 'PDF' : 'Image'} uploaded successfully
                </p>
              )}
            </div>
          )}
        </div>
      )}

     

      {/* PDF Processing Info */}
      {mode === 'chat' && uploadedFile?.type === 'pdf' && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">📄 PDF Processing</h3>
          <p className="text-sm text-blue-700">
            Your PDF has been uploaded and will be analyzed. You can ask questions like:
          </p>
          <ul className="text-xs text-blue-600 mt-1 ml-4 list-disc">
            <li>&quot;Summarize this document&quot;</li>
            <li>&quot;What are the key points?&quot;</li>
            <li>&quot;Extract the main conclusions&quot;</li>
            <li>&quot;Translate this document to Spanish&quot;</li>
          </ul>
        </div>
      )}

      {/* Question Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={
              mode === 'audio'
                ? "Enter text to convert to speech..."
                : mode === 'video'
                ? "Describe the video scene you want to generate..."
                : mode === 'image' 
                ? "Describe the image you want to generate..." 
                : uploadedFile?.type === 'pdf'
                ? "Ask about the PDF document..."
                : uploadedFile?.type === 'image'
                ? "Ask about the image..." 
                : "Ask me anything..."
            }
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading 
              ? (mode === 'audio' ? "Generating..." : mode === 'video' ? "Generating..." : mode === 'image' ? "Creating..." : "Analyzing...") 
              : (mode === 'audio' ? "Generate Speech" : mode === 'video' ? "Generate Video" : mode === 'image' ? "Generate Image" : "Ask")
            }
          </button>
        </div>
        
        {mode === 'audio' && (
          <p className="text-sm text-purple-600 mt-1">🎵 Text-to-speech mode - enter text to convert to audio</p>
        )}
        {mode === 'video' && (
          <p className="text-sm text-purple-600 mt-1">🎬 Video generation mode - describe your scene in detail</p>
        )}
        {mode === 'image' && (
          <p className="text-sm text-purple-600 mt-1">🎨 Image generation mode - describe what you want to create</p>
        )}
        {uploadedFile && mode === 'chat' && (
          <p className="text-sm text-blue-600 mt-1">
            {uploadedFile.type === 'pdf' ? 'PDF document' : 'Image'} will be included in your question
          </p>
        )}
      </form>

      {/* Video Progress */}
      {videoProgress && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">{videoProgress}</p>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '50%'}}></div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-red-800 font-semibold">Error:</h2>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">
            {mode === 'audio' ? "Converting text to speech..."
             : mode === 'video' ? "Creating your video (this may take several minutes)..." 
             : mode === 'image' ? "Creating your image..." 
             : uploadedFile?.type === 'pdf' ? "Analyzing document..."
             : "Analyzing..."}
          </span>
        </div>
      )}

  

   

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Generated Images:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedImages.map((imageData, index) => (
              <div key={index} className="border rounded-lg p-4">
                <img
                  src={`data:image/png;base64,${imageData}`}
                  alt={`Generated image ${index + 1}`}
                  className="w-full max-h-96 object-contain rounded"
                />
                <button
                  onClick={() => downloadImage(imageData, `generated-image-${index + 1}.png`)}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Download Image
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {response && !loading && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Response:</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
        </div>
      )}

      {!response && !loading && !error && generatedImages.length === 0 && !generatedVideo && !generatedAudio && (
        <div className="text-center py-8 text-gray-500">
          <p>
            {mode === 'audio'
              ? "Enter some text to convert to speech!"
              : mode === 'video'
              ? "Describe a video scene you'd like to generate!"
              : mode === 'image' 
              ? "Describe an image you'd like to generate!" 
              : "Upload an image or PDF document and ask questions, or just ask a text question to get started!"
            }
          </p>
        </div>
      )}
    </div>
  );
}
