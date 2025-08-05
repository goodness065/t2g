// "use client"
// import { 
//   GoogleGenAI,
//   createUserContent,
//   createPartFromUri,
//   Modality 
// } from "@google/genai";
// import { useState } from "react";

// export default function Home() {
//   const [question, setQuestion] = useState<string>("");
//   const [response, setResponse] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");
//   const [uploadedImage, setUploadedImage] = useState<{uri: string, mimeType: string} | null>(null);
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [generateImage, setGenerateImage] = useState<boolean>(false);
//   const [generatedImages, setGeneratedImages] = useState<string[]>([]);

//   async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (!file.type.startsWith('image/')) {
//       setError("Please select an image file");
//       return;
//     }

//     setImageFile(file);
//     setError("");
    
//     try {
//       const ai = new GoogleGenAI({
//         apiKey: 'AIzaSyCanEPvdR9XIPZWxfhg2Ko2DOA5XVs6qS0'
//       });

//       // Upload the image file to Google GenAI
//       const uploadedFile = await ai.files.upload({
//         file: file,
//       });

//       setUploadedImage({
//         uri: uploadedFile.uri,
//         mimeType: uploadedFile.mimeType
//       });
//     } catch (err) {
//       setError(`Image upload failed: ${err instanceof Error ? err.message : "Unknown error"}`);
//     }
//   }

//   function downloadImage(imageData: string, filename: string) {
//     // Convert base64 to blob and create download link
//     const byteCharacters = atob(imageData);
//     const byteNumbers = new Array(byteCharacters.length);
//     for (let i = 0; i < byteCharacters.length; i++) {
//       byteNumbers[i] = byteCharacters.charCodeAt(i);
//     }
//     const byteArray = new Uint8Array(byteNumbers);
//     const blob = new Blob([byteArray], { type: 'image/png' });
    
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = filename;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   }

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
    
//     if (!question.trim()) {
//       setError("Please enter a question");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setResponse("");
//     setGeneratedImages([]);

//     try {
//       const ai = new GoogleGenAI({
//         apiKey: 'AIzaSyCanEPvdR9XIPZWxfhg2Ko2DOA5XVs6qS0'
//       });

//       let contents;
//       let model = "gemini-2.5-flash";
//       let config: any = {};
      
//       if (generateImage) {
//         // Use image generation model and config
//         model = "gemini-2.0-flash-preview-image-generation";
//         config = {
//           responseModalities: [Modality.TEXT, Modality.IMAGE],
//         };
//         contents = question;
//       } else if (uploadedImage) {
//         // Create content with both text and image
//         contents = [
//           createUserContent([
//             question,
//             createPartFromUri(uploadedImage.uri, uploadedImage.mimeType),
//           ]),
//         ];
//       } else {
//         // Text-only content
//         contents = question;
//       }

//       const result = await ai.models.generateContent({
//         model: model,
//         contents: contents,
//         config: Object.keys(config).length > 0 ? config : undefined,
//       });

//       // Handle response based on whether we're generating images
//       if (generateImage && result.candidates?.[0]?.content?.parts) {
//         let textResponse = "";
//         const images: string[] = [];

//         for (const part of result.candidates[0].content.parts) {
//           if (part.text) {
//             textResponse += part.text;
//           } else if (part.inlineData) {
//             images.push(part.inlineData.data);
//           }
//         }

//         setResponse(textResponse || "Image generated successfully!");
//         setGeneratedImages(images);
//       } else {
//         setResponse(result.text || "No response received");
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   }

//   function clearImage() {
//     setUploadedImage(null);
//     setImageFile(null);
//     if (document.getElementById('image-input')) {
//       (document.getElementById('image-input') as HTMLInputElement).value = '';
//     }
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6 text-center">AI Chat Assistant</h1>
      
//       {/* Mode Selection */}
//       <div className="mb-6 p-4 border border-gray-200 rounded-lg">
//         <h2 className="text-lg font-semibold mb-3">Select Mode</h2>
//         <div className="flex items-center gap-4">
//           <label className="flex items-center">
//             <input
//               type="radio"
//               name="mode"
//               checked={!generateImage}
//               onChange={() => setGenerateImage(false)}
//               className="mr-2"
//             />
//             Chat Mode (analyze images & answer questions)
//           </label>
//           <label className="flex items-center">
//             <input
//               type="radio"
//               name="mode"
//               checked={generateImage}
//               onChange={() => setGenerateImage(true)}
//               className="mr-2"
//             />
//             Image Generation Mode
//           </label>
//         </div>
//       </div>

//       {/* Image Upload Section - only show in chat mode */}
//       {!generateImage && (
//         <div className="mb-6 p-4 border border-gray-200 rounded-lg">
//           <h2 className="text-lg font-semibold mb-3">Upload Image (Optional)</h2>
//           <div className="flex items-center gap-4">
//             <input
//               id="image-input"
//               type="file"
//               accept="image/*"
//               onChange={handleImageUpload}
//               className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//             />
//             {uploadedImage && (
//               <button
//                 onClick={clearImage}
//                 className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
//               >
//                 Clear
//               </button>
//             )}
//           </div>
          
//           {imageFile && (
//             <div className="mt-4">
//               <p className="text-sm text-gray-600 mb-2">Preview:</p>
//               <img
//                 src={URL.createObjectURL(imageFile)}
//                 alt="Preview"
//                 className="max-w-xs max-h-48 object-contain border rounded"
//               />
//               {uploadedImage && (
//                 <p className="text-sm text-green-600 mt-2">✓ Image uploaded successfully</p>
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Question Form */}
//       <form onSubmit={handleSubmit} className="mb-6">
//         <div className="flex gap-2">
//           <input
//             type="text"
//             value={question}
//             onChange={(e) => setQuestion(e.target.value)}
//             placeholder={
//               generateImage 
//                 ? "Describe the image you want to generate..." 
//                 : uploadedImage 
//                 ? "Ask about the image..." 
//                 : "Ask me anything..."
//             }
//             className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             disabled={loading}
//           />
//           <button
//             type="submit"
//             disabled={loading || !question.trim()}
//             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//           >
//             {loading ? (generateImage ? "Generating..." : "Asking...") : (generateImage ? "Generate" : "Ask")}
//           </button>
//         </div>
//         {generateImage && (
//           <p className="text-sm text-purple-600 mt-1">🎨 Image generation mode - describe what you want to create</p>
//         )}
//         {uploadedImage && !generateImage && (
//           <p className="text-sm text-blue-600 mt-1">Image will be included in your question</p>
//         )}
//       </form>

//       {error && (
//         <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
//           <h2 className="text-red-800 font-semibold">Error:</h2>
//           <p className="text-red-700">{error}</p>
//         </div>
//       )}

//       {loading && (
//         <div className="flex items-center justify-center py-8">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//           <span className="ml-2 text-gray-600">
//             {generateImage ? "Creating your image..." : "Analyzing..."}
//           </span>
//         </div>
//       )}

//       {/* Generated Images */}
//       {generatedImages.length > 0 && (
//         <div className="mb-6">
//           <h2 className="text-lg font-semibold mb-3">Generated Images:</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {generatedImages.map((imageData, index) => (
//               <div key={index} className="border rounded-lg p-4">
//                 <img
//                   src={`data:image/png;base64,${imageData}`}
//                   alt={`Generated image ${index + 1}`}
//                   className="w-full max-h-96 object-contain rounded"
//                 />
//                 <button
//                   onClick={() => downloadImage(imageData, `generated-image-${index + 1}.png`)}
//                   className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
//                 >
//                   Download Image
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {response && !loading && (
//         <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
//           <h2 className="text-lg font-semibold mb-2 text-gray-800">Response:</h2>
//           <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
//         </div>
//       )}

//       {!response && !loading && !error && generatedImages.length === 0 && (
//         <div className="text-center py-8 text-gray-500">
//           <p>
//             {generateImage 
//               ? "Describe an image you'd like to generate!" 
//               : "Upload an image and ask a question, or just ask a text question to get started!"
//             }
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }
