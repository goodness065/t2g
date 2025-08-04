"use client"
import { GoogleGenAI } from "@google/genai";
import { useState } from "react";
import { 
  Video, 
  Download, 
  Sparkles, 
  Film, 
  Star, 
  Info, 
  Lightbulb, 
  Play,
  Loader,
  CheckCircle,
  AlertTriangle,
  Clock,
  Camera,
  Clapperboard
} from 'lucide-react';

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [generatedVideo, setGeneratedVideo] = useState<{uri: string, originalUri?: string, blob?: Blob} | null>(null);
  const [videoProgress, setVideoProgress] = useState<string>("");

  const ai = new GoogleGenAI({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY
  });

  async function downloadVideoFile(videoUri: string, filename: string) {
    try {
      setVideoProgress("Preparing download...");
      
      // Handle the new URI format
      let downloadUrl = videoUri;
      
      // If it's already a direct download URL, use it as is
      if (videoUri.includes('download?alt=media')) {
        downloadUrl = videoUri;
      } else {
        // Fallback to old format extraction
        const fileId = videoUri.split('/files/')[1]?.split(':')[0];
        if (!fileId) {
          throw new Error("Invalid video URI format");
        }
        downloadUrl = `https://generativelanguage.googleapis.com/v1beta/files/${fileId}?alt=media`;
      }
      
      const response = await fetch(downloadUrl, {
        headers: {
          'X-Goog-Api-Key': process.env.GEMINI_API_KEY || '',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setVideoProgress("");
    } catch (err) {
      console.error('Download error:', err);
      setError(`Video download failed: ${err instanceof Error ? err.message : "Unknown error"}`);
      setVideoProgress("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError("Please enter a video prompt");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedVideo(null);
    setVideoProgress("");

    try {
      setVideoProgress("Starting video generation...");
      
      let operation = await ai.models.generateVideos({
        model: "veo-3.0-generate-preview",
        prompt: prompt,
      });

      let pollCount = 0;
      const maxPolls = 60;
      
      while (!operation.done && pollCount < maxPolls) {
        setVideoProgress(`Video generation in progress... (${pollCount * 10}s elapsed)`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
        
        operation = await ai.operations.getVideosOperation({
          operation: operation,
        });
        
        pollCount++;
      }

      console.log(operation);

      if (operation.done && operation.response?.generatedVideos?.[0]?.video) {
        setVideoProgress("Video generation completed!");
        
        const originalVideoUri = operation.response.generatedVideos[0].video.uri;
        
        try {
          // @ts-expect-error - originalVideoUri is not typed
          const response = await fetch(originalVideoUri, {
            headers: {
              'X-Goog-Api-Key': process.env.GEMINI_API_KEY,
            },
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            setGeneratedVideo({ uri: blobUrl, originalUri: originalVideoUri, blob });
          } else {
            // @ts-expect-error - originalVideoUri is not typed
            setGeneratedVideo({ uri: originalVideoUri, originalUri: originalVideoUri });
          }
        } catch (previewError) {
          console.warn('Could not load video preview:', previewError);
          // @ts-expect-error - originalVideoUri is not typed
          setGeneratedVideo({ uri: originalVideoUri, originalUri: originalVideoUri });
        }
        
      } else {
        setError("Video generation failed or timed out. Please try again with a shorter or simpler prompt.");
      }

    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
      setVideoProgress("");
    }
  }

  // Sample prompts organized by category
  const samplePrompts = [
    {
      category: "Cinematic Scenes",
      prompts: [
        "A close up of two people staring at a cryptic drawing on a wall, torchlight flickering",
        "A drone shot of a lone figure walking through a misty forest at dawn",
        "Slow motion shot of rain drops hitting a window while someone watches from inside",
        "A time-lapse of clouds forming over a mountain peak during golden hour"
      ],
      icon: "🎬",
      color: "from-red-500 to-pink-600"
    },
    {
      category: "Action & Adventure", 
      prompts: [
        "A person parkour jumping between rooftops in an urban environment",
        "A car chase through narrow city streets with dramatic lighting",
        "A surfer riding a massive wave during a storm",
        "A cyclist speeding down a mountain trail with dust clouds behind them"
      ],
      icon: "⚡",
      color: "from-orange-500 to-red-600"
    },
    {
      category: "Nature & Wildlife",
      prompts: [
        "A majestic eagle soaring over a vast canyon landscape",
        "Ocean waves crashing against rocky cliffs in slow motion",
        "A butterfly landing on a flower in a meadow with soft focus background",
        "Northern lights dancing in the sky above a snow-covered forest"
      ],
      icon: "🦅",
      color: "from-green-500 to-emerald-600"
    }
  ];

  const videoTips = [
    { icon: "🎭", tip: "Include characters", detail: "Describe people, animals, or objects in action" },
    { icon: "🎥", tip: "Camera angles", detail: "close-up, wide shot, drone view, tracking shot" },
    { icon: "💡", tip: "Lighting & mood", detail: "golden hour, dramatic shadows, neon lighting" },
    { icon: "🎬", tip: "Movement", detail: "slow motion, fast-paced, smooth transitions" },
    { icon: "🏞️", tip: "Setting details", detail: "Describe the environment and atmosphere" }
  ];

  return (
    <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        {/* Left Column - Input & Controls */}
        <div className="space-y-8">
          {/* Model Info Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl shadow-lg">
                <Film className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Veo 3.0 Video Generator</h3>
                <p className="text-gray-600">Google&apos;s most advanced AI video generation model</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 border border-red-200">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-800">HD Quality</span>
                </div>
                <p className="text-red-700 text-sm">Professional video resolution and clarity</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Camera className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold text-orange-800">Cinematic</span>
                </div>
                <p className="text-orange-700 text-sm">Movie-quality shots and transitions</p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 border border-yellow-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">5-10 Minutes</span>
                </div>
                <p className="text-yellow-700 text-sm">Generation time for best results</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-yellow-800 font-medium text-sm">Generation Time</p>
                  <p className="text-yellow-700 text-sm">Video generation typically takes 5-10 minutes. The more detailed your prompt, the better the result!</p>
                </div>
              </div>
            </div>
          </div>

           {/* Sample Prompts */}
           <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Scene Inspiration</h3>
                <p className="text-gray-600">Professional video prompts to get you started</p>
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
                        className="group text-left p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-red-50 hover:to-orange-50 border-2 border-gray-200 hover:border-red-300 rounded-2xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <p className="text-gray-800 text-sm leading-relaxed">
                          &quot;{samplePrompt}&quot;
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
              <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg">
                <Clapperboard className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Describe Your Scene</h3>
                <p className="text-gray-600">Be specific about characters, actions, and camera work</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the video scene you want to create... Include details about characters, actions, setting, lighting, and camera angles for the best cinematic results."
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 resize-none transition-all duration-300 text-lg min-h-[120px]"
                  disabled={loading}
                />
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm">
                    <span className={`font-medium ${prompt.length > 450 ? 'text-red-600' : 'text-gray-600'}`}>
                      {prompt.length} characters
                    </span>
                    <span className="text-gray-500 ml-2">(100-500 recommended)</span>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="group relative w-full inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader className="h-6 w-6 animate-spin" />
                    <span>Creating Cinema...</span>
                  </>
                ) : (
                  <>
                    <Video className="h-6 w-6" />
                    <span>Generate Video</span>
                    <Sparkles className="h-5 w-5 opacity-70" />
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-50 -z-10 group-hover:opacity-70 transition-opacity"></div>
              </button>
            </form>
          </div>

 {/* Right Column - Results & Progress */}
 <div className="space-y-8">
          {/* Progress Display */}
          {(loading || videoProgress) && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                  <Loader className="h-8 w-8 text-white animate-spin" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Video Generation</h3>
                  <p className="text-gray-600 text-sm">Creating your cinematic masterpiece</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700 font-medium">
                  {videoProgress || "Processing your video prompt..."}
                </p>
                <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full animate-pulse transition-all duration-300" 
                       style={{width: loading ? '70%' : '100%'}}></div>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>• Analyzing your prompt and scene requirements</p>
                  <p>• Generating video frames with Veo 3.0</p>
                  <p>• Applying cinematic effects and transitions</p>
                  <p>• Finalizing your HD video file</p>
                </div>
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

          {/* Generated Video */}
          {generatedVideo && (
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg">
                  <Video className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Your Video</h3>
                  <p className="text-gray-600">Generated with Veo 3.0</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  {typeof generatedVideo.uri === 'string' && generatedVideo.uri.startsWith('blob:') ? (
                    <div className="space-y-4">
                      <video
                        controls
                        className="w-full max-h-96 rounded-xl shadow-lg"
                        src={generatedVideo.uri}
                      >
                        Your browser does not support the video tag.
                      </video>
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium text-sm">Video ready for preview</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-4 bg-green-100 rounded-2xl inline-block mb-4">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">Video Generated Successfully!</h4>
                      <p className="text-gray-600 text-sm">Click download to save your video file.</p>
                    </div>
                  )}
                  
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">Format:</span>
                        <p className="text-gray-600">MP4 Video</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Model:</span>
                        <p className="text-gray-600">Veo 3.0</p>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-semibold text-gray-700 text-sm">Prompt:</span>
                      <p className="text-gray-600 text-sm italic bg-white p-3 rounded-lg mt-1">
                        &quot;{prompt.length > 100 ? `${prompt.substring(0, 100)}...` : prompt}&quot;
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        const downloadUri = generatedVideo.originalUri || generatedVideo.uri;
                        downloadVideoFile(downloadUri, `generated-video-${Date.now()}.mp4`);
                      }}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <Download className="h-5 w-5" />
                      <span>Download HD Video</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!generatedVideo && !loading && !error && !videoProgress && (
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 text-center">
              <div className="p-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl inline-block mb-6">
                <Video className="h-16 w-16 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Create</h3>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                Describe any scene you can imagine and watch AI create a cinematic video with Veo 3.0
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-red-600">
                  <Film className="h-4 w-4" />
                  <span>HD Quality</span>
                </div>
                <div className="flex items-center space-x-2 text-orange-600">
                  <Camera className="h-4 w-4" />
                  <span>Cinematic Shots</span>
                </div>
                <div className="flex items-center space-x-2 text-yellow-600">
                  <Play className="h-4 w-4" />
                  <span>Any Scene</span>
                </div>
                <div className="flex items-center space-x-2 text-green-600">
                  <Download className="h-4 w-4" />
                  <span>Instant Download</span>
                </div>
              </div>
            </div>
          )}
        </div>
         

          {/* Video Tips */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Cinematic Tips</h3>
                <p className="text-gray-600">Create professional-quality videos</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videoTips.map((tip, index) => (
                <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">{tip.icon}</span>
                    <h5 className="font-bold text-green-800 text-sm">{tip.tip}</h5>
                  </div>
                  <p className="text-green-700 text-xs">{tip.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
} 
