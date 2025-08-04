"use client"
import { GoogleGenAI } from "@google/genai";
import { useState } from "react";

export default function SpeechGenerator() {
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [generatedAudio, setGeneratedAudio] = useState<{data: string, url?: string} | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("Kore");

  const ai = new GoogleGenAI({
    apiKey: 'AIzaSyBE8d2iMY1ZtV5Hs201Njy55K6xobgBd6E'
  });

  // Available voices for TTS
  const voices = [
    { name: 'Kore', description: 'Warm and friendly' },
    { name: 'Charon', description: 'Deep and authoritative' },
    { name: 'Fenrir', description: 'Strong and confident' },
    { name: 'Aoede', description: 'Melodic and expressive' },
    { name: 'Puck', description: 'Playful and energetic' }
  ];

  // Convert PCM data to WAV format
  function convertPCMToWAV(pcmData: Uint8Array, sampleRate: number, channels: number): ArrayBuffer {
    const length = pcmData.length;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * 2, true);
    view.setUint16(32, channels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);
    
    // Copy PCM data
    const pcmView = new Uint8Array(buffer, 44);
    pcmView.set(pcmData);
    
    return buffer;
  }

  // Create audio URL from base64 data
  function createAudioUrl(base64Data: string): string {
    // Convert base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Convert PCM to WAV format
    const wavBuffer = convertPCMToWAV(bytes, 24000, 1);
    
    // Create blob with proper audio MIME type
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  function downloadAudio(audioData: string, filename: string) {
    // Convert base64 to binary
    const binaryString = atob(audioData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Convert PCM to WAV format
    const wavBuffer = convertPCMToWAV(bytes, 24000, 1);
    
    // Create blob and download
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
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
    
    if (!text.trim()) {
      setError("Please enter some text to convert to speech");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedAudio(null);

    try {
      console.log("Generating audio with voice:", selectedVoice);
      
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      console.log("TTS Response:", result);

      const audioData = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (audioData) {
        console.log("Audio data received, length:", audioData.length);
        
        // Create audio URL for playback
        const audioUrl = createAudioUrl(audioData);
        
        setGeneratedAudio({ data: audioData, url: audioUrl });
      } else {
        console.error("No audio data in response:", result.candidates?.[0]?.content?.parts);
        setError("No audio data received from the model");
      }

    } catch (err) {
      console.error('Speech generation error:', err);
      setError(err instanceof Error ? err.message : "An error occurred during speech generation");
    } finally {
      setLoading(false);
    }
  }

  // Sample prompts for inspiration
  const samplePrompts = [
    "Say cheerfully: Have a wonderful day!",
    "Read this like a news anchor: Breaking news from the tech world today.",
    "Speak in a calm, meditative voice: Take a deep breath and relax.",
    "Say with excitement: Congratulations on your amazing achievement!",
    "Read this like storytelling: Once upon a time, in a land far away..."
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🎵 AI Speech Generator</h1>
      
      {/* Voice Selection */}
      <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h3 className="text-lg font-semibold text-purple-800 mb-3">🎤 Voice Selection</h3>
        <p className="text-sm text-purple-700 mb-3">
          Choose a voice for your text-to-speech generation:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {voices.map((voice) => (
            <label key={voice.name} className="flex items-start cursor-pointer">
              <input
                type="radio"
                name="voice"
                value={voice.name}
                checked={selectedVoice === voice.name}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="mr-2 mt-1"
              />
              <div className="text-sm">
                <div className="font-medium text-purple-800">{voice.name}</div>
                <div className="text-purple-600">{voice.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Sample Prompts */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 Sample Prompts</h3>
        <p className="text-sm text-blue-700 mb-3">Try these examples or create your own:</p>
        <div className="space-y-2">
          {samplePrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => setText(prompt)}
              className="block w-full text-left text-sm p-2 bg-white border border-blue-200 rounded hover:bg-blue-100 transition-colors"
            >
              &quot;{prompt}&quot;
            </button>
          ))}
        </div>
      </div>

      {/* Text Input Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
            Text to Convert to Speech
          </label>
          <textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter the text you want to convert to speech... You can include instructions like 'Say cheerfully:' or 'Read in a calm voice:'"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            rows={4}
            disabled={loading}
          />
          <div className="mt-1 text-sm text-gray-500">
            Characters: {text.length} (recommended: 50-500 characters for best results)
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? "Generating Speech..." : "🎵 Generate Speech"}
        </button>
        
        <p className="text-sm text-purple-600 mt-2 text-center">
          Selected voice: <strong>{selectedVoice}</strong>
        </p>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-red-800 font-semibold">Error:</h2>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Converting text to speech...</span>
        </div>
      )}

      {/* Generated Audio */}
      {generatedAudio && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">🎵 Generated Speech:</h2>
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="mb-4">
              <h3 className="font-medium text-gray-800 mb-2">Audio Player:</h3>
              <audio
                controls
                className="w-full"
                src={generatedAudio.url}
                preload="metadata"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="text-sm text-gray-600">
                <div><strong>Voice:</strong> {selectedVoice}</div>
                <div><strong>Format:</strong> WAV Audio</div>
                <div><strong>Text:</strong> &quot;{text.substring(0, 50)}{text.length > 50 ? '...' : ''}&quot;</div>
              </div>
              
              <button
                onClick={() => downloadAudio(generatedAudio.data, `speech-${selectedVoice.toLowerCase()}-${Date.now()}.wav`)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
              >
                📥 Download Audio
              </button>
            </div>
          </div>
        </div>
      )}

      {!generatedAudio && !loading && !error && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">🎤</div>
          <p className="text-lg">Enter some text above to convert it to speech!</p>
          <p className="text-sm mt-2">Try adding instructions like &quot;Say cheerfully:&quot; or &quot;Read dramatically:&quot; for different styles.</p>
        </div>
      )}
      
      {/* Tips */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">💡 Tips for Better Speech Generation:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Add emotion instructions: &quot;Say cheerfully:&quot;, &quot;Read sadly:&quot;, &quot;Speak with excitement:&quot;</li>
          <li>• Use punctuation for natural pauses and emphasis</li>
          <li>• Try different voices for different content types</li>
          <li>• Keep text between 50-500 characters for optimal results</li>
          <li>• Include context: &quot;Read like a news anchor:&quot; or &quot;Say like telling a story:&quot;</li>
        </ul>
      </div>
    </div>
  );
}