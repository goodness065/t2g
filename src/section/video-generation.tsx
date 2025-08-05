"use client"
import { GoogleGenAI } from "@google/genai";
import { useState } from "react";

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [generatedVideo, setGeneratedVideo] = useState<{uri: string, originalUri?: string, blob?: Blob} | null>(null);
  const [videoProgress, setVideoProgress] = useState<string>("");

  const ai = new GoogleGenAI({
    apiKey: 'AIzaSyBE8d2iMY1ZtV5Hs201Njy55K6xobgBd6E'
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
          'X-Goog-Api-Key': 'AIzaSyBE8d2iMY1ZtV5Hs201Njy55K6xobgBd6E',
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
              'X-Goog-Api-Key': 'AIzaSyBE8d2iMY1ZtV5Hs201Njy55K6xobgBd6E',
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🎬 AI Video Generator</h1>
      
      {/* Video Generation Info */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Video Generation Tips</h3>
        <p className="text-sm text-yellow-700">
          Video generation typically takes 5-10 minutes. Be specific in your prompt and include details about:
          characters, actions, setting, lighting, and camera angles.
        </p>
        <p className="text-xs text-yellow-600 mt-1">
          Example: &quot;A close up of two people staring at a cryptic drawing on a wall, torchlight flickering...&quot;
        </p>
      </div>

      {/* Prompt Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the video scene you want to generate..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Generating..." : "Generate Video"}
          </button>
        </div>
        <p className="text-sm text-purple-600 mt-1">🎬 Video generation mode - describe your scene in detail</p>
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
          <span className="ml-2 text-gray-600">Creating your video (this may take several minutes)...</span>
        </div>
      )}

      {/* Generated Video */}
      {generatedVideo && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Generated Video:</h2>
          <div className="border rounded-lg p-4">
            {typeof generatedVideo.uri === 'string' && generatedVideo.uri.startsWith('blob:') ? (
              <video
                controls
                className="w-full max-h-96 rounded"
                src={generatedVideo.uri}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="bg-gray-100 p-8 rounded text-center">
                <p className="text-gray-600 mb-4">Video generated successfully!</p>
                <p className="text-sm text-gray-500">Click download to save the video file.</p>
              </div>
            )}
            <button
              onClick={() => {
                const downloadUri = generatedVideo.originalUri || generatedVideo.uri;
                downloadVideoFile(downloadUri, 'generated-video.mp4');
              }}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Download Video
            </button>
          </div>
        </div>
      )}

      {!generatedVideo && !loading && !error && (
        <div className="text-center py-8 text-gray-500">
          <p>Describe a video scene you&apos;d like to generate!</p>
        </div>
      )}
    </div>
  );
} 
