/* eslint-disable @next/next/no-img-element */
"use client"
import { GoogleGenAI } from "@google/genai";
import { useState } from "react";
import { 
  ImageIcon, 
  Download, 
  Sparkles, 
  Palette, 
  Zap, 
  Star, 
  Info, 
  Lightbulb, 
  Settings,
  Loader,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  });

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

  async function listAvailableModels() {
    try {
      const models = await ai.models.list();
      console.log("Available models:", models);
      return models;
    } catch (error) {
      console.error("Error listing models:", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError("Please enter an image prompt");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedImages([]);

    try {
      console.log("Generating image with prompt:", prompt);
      
      // Use the specific generateImages method for Imagen models
      const result = await ai.models.generateImages({
        model: 'imagen-4.0-generate-preview-06-06',
        prompt: prompt,
        config: {
          numberOfImages: 1,
        },
      });

      console.log("Image Generation Response:", result);

      if (result.generatedImages && result.generatedImages.length > 0) {
        const images: string[] = [];
        
        for (const generatedImage of result.generatedImages) {
          if (generatedImage.image?.imageBytes) {
            images.push(generatedImage.image.imageBytes);
          }
        }

        if (images.length > 0) {
          setGeneratedImages(images);
        } else {
          setError("No image data received from the model");
        }
      } else {
        setError("No images were generated");
      }

    } catch (err) {
      console.error('Image generation error:', err);
      if (err instanceof Error && err.message.includes("not available in your country")) {
        setError("Image generation is not available in your country. This is a regional restriction from Google.");
      } else {
        setError(err instanceof Error ? err.message : "An error occurred during image generation");
      }
    } finally {
      setLoading(false);
    }
  }

  // Sample prompts for inspiration organized by category
  const samplePrompts = [
    {
      category: "Fantasy & Sci-Fi",
      prompts: [
        "A 3d rendered image of a pig with wings and a top hat flying over a happy futuristic scifi city with lots of greenery",
        "A cyberpunk street scene with neon lights and flying cars in the rain",
        "A magical forest with glowing mushrooms and fairy lights at twilight",
        "A dragon made of crystalline structures perched on a mountain peak"
      ],
      icon: "🐉",
      color: "from-purple-500 to-pink-600"
    },
    {
      category: "Nature & Landscapes", 
      prompts: [
        "A serene Japanese garden with cherry blossoms in full bloom during golden hour",
        "An underwater city with coral buildings and schools of colorful fish",
        "A mountain landscape with aurora borealis dancing in the starry night sky",
        "A tropical waterfall surrounded by lush rainforest vegetation"
      ],
      icon: "🌸",
      color: "from-green-500 to-emerald-600"
    },
    {
      category: "Architecture & Design",
      prompts: [
        "A steampunk airship floating above Victorian London with brass gears and steam",
        "A cozy coffee shop in space with Earth visible through large windows",
        "Modern minimalist house built into a cliffside overlooking the ocean",
        "Ancient temple ruins overgrown with vibrant jungle vegetation"
      ],
      icon: "🏛️",
      color: "from-blue-500 to-indigo-600"
    }
  ];

  const artStyleTips = [
    { style: "Photorealistic", description: "Ultra-realistic, detailed photography style" },
    { style: "Digital Art", description: "Modern digital illustration and concept art" },
    { style: "Oil Painting", description: "Classic fine art with rich textures" },
    { style: "Watercolor", description: "Soft, flowing artistic medium" },
    { style: "3D Rendered", description: "Computer-generated three-dimensional imagery" },
    { style: "Anime/Manga", description: "Japanese animation and comic book style" }
  ];

  return (
    <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        {/* Left Column - Input & Controls */}
        <div className="space-y-8">
          {/* Model Info Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Imagen 4.0 Generator</h3>
                <p className="text-gray-600">Google&apos;s most advanced AI image generation model</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">High Quality</span>
                </div>
                <p className="text-blue-700 text-sm">Superior image resolution and detail</p>
              </div>
              
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-4 border border-cyan-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-5 w-5 text-cyan-600" />
                  <span className="font-semibold text-cyan-800">Fast Generation</span>
                </div>
                <p className="text-cyan-700 text-sm">Quick processing and delivery</p>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-4 border border-indigo-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Palette className="h-5 w-5 text-indigo-600" />
                  <span className="font-semibold text-indigo-800">Any Style</span>
                </div>
                <p className="text-indigo-700 text-sm">Photorealistic to abstract art</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-yellow-800 font-medium text-sm">Regional Availability</p>
                  <p className="text-yellow-700 text-sm">This feature may not be available in all regions due to Google&apos;s restrictions.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Prompts */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Creative Inspiration</h3>
                <p className="text-gray-600">Click any prompt to try it out</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {samplePrompts.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 bg-gradient-to-br ${category.color} rounded-xl`}>
                      <span className="text-white text-lg">{category.icon}</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">{category.category}</h4>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-3">
                    {category.prompts.map((samplePrompt, index) => (
                      <button
                        key={index}
                        onClick={() => setPrompt(samplePrompt)}
                        className="group text-left p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-cyan-50 border-2 border-gray-200 hover:border-blue-300 rounded-2xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <p className="text-gray-800 text-sm leading-relaxed">
                          &quot;{samplePrompt.length > 80 ? `${samplePrompt.substring(0, 80)}...` : samplePrompt}&quot;
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg">
                <ImageIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Describe Your Vision</h3>
                <p className="text-gray-600">The more detailed, the better the result</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to create... Be specific about style, colors, mood, lighting, and composition for the best results."
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 resize-none transition-all duration-300 text-lg min-h-[120px]"
                  disabled={loading}
                />
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm">
                    <span className={`font-medium ${prompt.length > 180 ? 'text-red-600' : 'text-gray-600'}`}>
                      {prompt.length} characters
                    </span>
                    <span className="text-gray-500 ml-2">(50-200 recommended)</span>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="group relative w-full inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader className="h-6 w-6 animate-spin" />
                    <span>Generating Magic...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-6 w-6" />
                    <span>Generate Image</span>
                    <Zap className="h-5 w-5 opacity-70" />
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-50 -z-10 group-hover:opacity-70 transition-opacity"></div>
              </button>
            </form>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 text-center">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl inline-block mb-6">
                <Loader className="h-12 w-12 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Creating Your Image</h3>
              <p className="text-gray-600">
                AI is painting your vision with Imagen 4.0...
              </p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-3xl p-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-red-100 rounded-2xl">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-800">Generation Error</h3>
                  <p className="text-red-600 text-sm">Something went wrong</p>
                </div>
              </div>
              <p className="text-red-700 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Generated Images */}
          {generatedImages.length > 0 && (
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg">
                  <ImageIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Your Creation</h3>
                  <p className="text-gray-600">Generated with Imagen 4.0</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {generatedImages.map((imageData, index) => (
                  <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                    <div className="mb-4">
                      <img
                        src={`data:image/png;base64,${imageData}`}
                        alt={`Generated image ${index + 1}`}
                        className="w-full max-h-96 object-contain rounded-xl shadow-lg"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">Format:</span>
                          <p className="text-gray-600">PNG Image</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Model:</span>
                          <p className="text-gray-600">Imagen 4.0</p>
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-semibold text-gray-700 text-sm">Prompt:</span>
                        <p className="text-gray-600 text-sm italic bg-white p-3 rounded-lg mt-1">
                          &quot;{prompt.length > 100 ? `${prompt.substring(0, 100)}...` : prompt}&quot;
                        </p>
                      </div>
                      
                      <button
                        onClick={() => downloadImage(imageData, `generated-image-${index + 1}-${Date.now()}.png`)}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <Download className="h-5 w-5" />
                        <span>Download High Quality</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
            {/* Empty State */}
            {!generatedImages.length && !loading && !error && (
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 text-center">
              <div className="p-6 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl inline-block mb-6">
                <ImageIcon className="h-16 w-16 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Create</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Describe any image you can imagine and watch AI bring it to life with Imagen 4.0
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-blue-600">
                  <Sparkles className="h-4 w-4" />
                  <span>Any Art Style</span>
                </div>
                <div className="flex items-center space-x-2 text-cyan-600">
                  <Zap className="h-4 w-4" />
                  <span>Fast Generation</span>
                </div>
                <div className="flex items-center space-x-2 text-indigo-600">
                  <ImageIcon className="h-4 w-4" />
                  <span>High Quality</span>
                </div>
                <div className="flex items-center space-x-2 text-purple-600">
                  <Download className="h-4 w-4" />
                  <span>Instant Download</span>
                </div>
              </div>
            </div>
          )}

          {/* Art Style Guide */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl shadow-lg">
                <Palette className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Art Style Guide</h3>
                <p className="text-gray-600">Popular styles to include in your prompts</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artStyleTips.map((tip, index) => (
                <div key={index} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-200">
                  <h5 className="font-bold text-orange-800 mb-2">{tip.style}</h5>
                  <p className="text-orange-700 text-sm">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Results & Tips */}
        <div className="space-y-8">
          

          {/* Tips Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Pro Tips</h3>
                <p className="text-gray-600 text-sm">For better results</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { icon: "🎨", tip: "Specify art style", detail: "photorealistic, oil painting, digital art" },
                { icon: "💡", tip: "Include lighting", detail: "golden hour, neon lighting, soft ambient" },
                { icon: "📐", tip: "Mention composition", detail: "close-up, wide angle, bird's eye view" },
                { icon: "🌈", tip: "Add mood & colors", detail: "serene, dramatic, warm colors, vibrant" },
                { icon: "🔍", tip: "Be specific", detail: "More details = better results" }
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-yellow-800 text-sm">{item.tip}</p>
                    <p className="text-yellow-700 text-xs">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Debug Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl shadow-lg">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Debug Tools</h3>
                <p className="text-gray-600 text-sm">Check system status</p>
              </div>
            </div>
            
            <button
              onClick={listAvailableModels}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              <Settings className="h-5 w-5" />
              <span>Check Available Models</span>
            </button>
            
            <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <p className="text-gray-700 text-xs font-medium mb-1">Available Models:</p>
              <p className="text-gray-600 text-xs">imagen-3.0, imagen-4.0-generate, imagen-4.0-ultra</p>
            </div>
          </div>

        
        </div>
      </div>
    </div>
  );
}