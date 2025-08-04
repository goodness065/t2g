// "use client"
// import { GoogleGenAI, Modality } from "@google/genai";
// import { useState } from "react";

// export default function ImageGenerator() {
//   const [prompt, setPrompt] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");
//   const [generatedImages, setGeneratedImages] = useState<string[]>([]);
//   const [response, setResponse] = useState<string>("");

//  

//   function downloadImage(imageData: string, filename: string) {
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

//   async function listAvailableModels() {
//     try {
//       const models = await ai.models.list();
//       console.log("Available models:", models);
//       return models;
//     } catch (error) {
//       console.error("Error listing models:", error);
//     }
//   }

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
    
//     if (!prompt.trim()) {
//       setError("Please enter an image prompt");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setGeneratedImages([]);
//     setResponse("");

//     try {
//       console.log("Generating image with prompt:", prompt);
      
//       // Use the specific generateImages method for Imagen models
//       const result = await ai.models.generateImages({
//         model: 'imagen-4.0-generate-preview-06-06',
//         prompt: prompt,
//         config: {
//           numberOfImages: 2,
//         },
//       });

//       console.log("Image Generation Response:", result);

//       if (result.generatedImages && result.generatedImages.length > 0) {
//         const images: string[] = [];
        
//         for (const generatedImage of result.generatedImages) {
//           if (generatedImage.image?.imageBytes) {
//             images.push(generatedImage.image.imageBytes);
//           }
//         }

//         if (images.length > 0) {
//           setGeneratedImages(images);
//           setResponse(`Successfully generated ${images.length} image(s)!`);
//         } else {
//           setError("No image data received from the model");
//         }
//       } else {
//         setError("No images were generated");
//       }

//     } catch (err) {
//       console.error('Image generation error:', err);
//       if (err instanceof Error && err.message.includes("not available in your country")) {
//         setError("Image generation is not available in your country. This is a regional restriction from Google.");
//       } else {
//         setError(err instanceof Error ? err.message : "An error occurred during image generation");
//       }
//     } finally {
//       setLoading(false);
//     }
//   }

//   // Sample prompts for inspiration
//   const samplePrompts = [
//     "A 3d rendered image of a pig with wings and a top hat flying over a happy futuristic scifi city with lots of greenery",
//     "A serene Japanese garden with cherry blossoms in full bloom during golden hour",
//     "A cyberpunk street scene with neon lights and flying cars in the rain",
//     "A magical forest with glowing mushrooms and fairy lights at twilight",
//     "A steampunk airship floating above Victorian London with brass gears and steam",
//     "An underwater city with coral buildings and schools of colorful fish",
//     "A cozy coffee shop in space with Earth visible through large windows",
//     "A dragon made of crystalline structures perched on a mountain peak"
//   ];

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6 text-center">🎨 AI Image Generator</h1>
      
//       {/* Image Generation Info */}
//       <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
//         <h3 className="text-lg font-semibold text-green-800 mb-2">🎨 Imagen 4.0 Generator</h3>
//         <p className="text-sm text-green-700">
//           Using Google's latest Imagen 4.0 model for high-quality image generation. 
//           Each request generates 2 images for you to choose from.
//         </p>
//         <p className="text-xs text-green-600 mt-1">
//           Note: This feature may not be available in all regions due to Google's restrictions.
//         </p>
//       </div>

//       {/* Image Generation Info */}
//       <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//         <h3 className="text-lg font-semibold text-yellow-800 mb-2">Image Generation Tips</h3>
//         <p className="text-sm text-yellow-700">
//           Be specific and descriptive in your prompts. Include details about style, lighting, composition, and mood for better results.
//         </p>
//         <p className="text-xs text-yellow-600 mt-1">
//           Example: "A 3D rendered magical forest with glowing mushrooms, soft purple lighting, and ethereal mist"
//         </p>
//       </div>

//       {/* Sample Prompts */}
//       <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//         <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 Sample Prompts</h3>
//         <p className="text-sm text-blue-700 mb-3">Try these creative examples or create your own:</p>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//           {samplePrompts.map((samplePrompt, index) => (
//             <button
//               key={index}
//               onClick={() => setPrompt(samplePrompt)}
//               className="text-left text-sm p-3 bg-white border border-blue-200 rounded hover:bg-blue-100 transition-colors"
//             >
//               "{samplePrompt.substring(0, 80)}{samplePrompt.length > 80 ? '...' : ''}"
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Prompt Form */}
//       <form onSubmit={handleSubmit} className="mb-6">
//         <div className="mb-4">
//           <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-700 mb-2">
//             Image Description
//           </label>
//           <textarea
//             id="prompt-input"
//             value={prompt}
//             onChange={(e) => setPrompt(e.target.value)}
//             placeholder="Describe the image you want to generate... Be specific about style, colors, mood, and composition for best results."
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
//             rows={4}
//             disabled={loading}
//           />
//           <div className="mt-1 text-sm text-gray-500">
//             Characters: {prompt.length} (recommended: 50-200 characters for optimal results)
//           </div>
//         </div>
        
//         <button
//           type="submit"
//           disabled={loading || !prompt.trim()}
//           className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
//         >
//           {loading ? "Generating Images..." : "🎨 Generate Images (2x)"}
//         </button>
        
//         <p className="text-sm text-purple-600 mt-2 text-center">
//           🎨 Using Imagen 4.0 - generates 2 high-quality images per request
//         </p>
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
//           <span className="ml-2 text-gray-600">Creating your images with Imagen 4.0...</span>
//         </div>
//       )}

//       {/* AI Response Text */}
//       {response && !loading && (
//         <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
//           <h2 className="text-lg font-semibold mb-2 text-gray-800">AI Response:</h2>
//           <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
//         </div>
//       )}

//       {/* Generated Images */}
//       {generatedImages.length > 0 && (
//         <div className="mb-6">
//           <h2 className="text-lg font-semibold mb-3">Generated Images:</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {generatedImages.map((imageData, index) => (
//               <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
//                 <img
//                   src={`data:image/png;base64,${imageData}`}
//                   alt={`Generated image ${index + 1}`}
//                   className="w-full max-h-96 object-contain rounded mb-3"
//                 />
//                 <div className="flex justify-between items-center">
//                   <div className="text-sm text-gray-600">
//                     <div><strong>Format:</strong> PNG</div>
//                     <div><strong>Prompt:</strong> "{prompt.substring(0, 50)}{prompt.length > 50 ? '...' : ''}"</div>
//                   </div>
//                   <button
//                     onClick={() => downloadImage(imageData, `generated-image-${index + 1}-${Date.now()}.png`)}
//                     className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
//                   >
//                     📥 Download
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {!generatedImages.length && !loading && !error && (
//         <div className="text-center py-8 text-gray-500">
//           <div className="text-4xl mb-4">🎨</div>
//           <p className="text-lg">Describe an image you'd like to generate!</p>
//           <p className="text-sm mt-2">Be creative and specific - include details about style, colors, lighting, and composition.</p>
//         </div>
//       )}
      
//       {/* Tips */}
//       <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
//         <h3 className="font-semibold text-gray-800 mb-2">💡 Tips for Better Image Generation:</h3>
//         <ul className="text-sm text-gray-600 space-y-1">
//           <li>• Be specific about art style: "photorealistic", "oil painting", "digital art", "3D rendered"</li>
//           <li>• Include lighting details: "golden hour", "neon lighting", "soft ambient light"</li>
//           <li>• Specify composition: "close-up", "wide angle", "bird's eye view", "low angle"</li>
//           <li>• Add mood and atmosphere: "serene", "dramatic", "whimsical", "mysterious"</li>
//           <li>• Mention colors and materials: "warm colors", "metallic textures", "vibrant pastels"</li>
//         </ul>
//       </div>

//       {/* Debug Section */}
//       <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//         <h3 className="font-semibold text-yellow-800 mb-2">🔧 Debug: Check Available Models</h3>
//         <button
//           onClick={listAvailableModels}
//           className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
//         >
//           List Available Models (Check Console)
//         </button>
//         <p className="text-xs text-yellow-600 mt-2">
//           Available image models: imagen-3.0-generate-002, imagen-4.0-generate-preview-06-06, imagen-4.0-ultra-generate-preview-06-06
//         </p>
//       </div>
//     </div>
//   );
// }