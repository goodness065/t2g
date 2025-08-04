"use client"
import { GoogleGenAI } from "@google/genai";
import { useState } from "react";

export default function SpeechGenerator() {
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [generatedAudio, setGeneratedAudio] = useState<{data: string, url?: string} | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("Kore");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [translatedText, setTranslatedText] = useState<string>("");

  const ai = new GoogleGenAI({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY
  });

  // Available voices for TTS
  const voices = [
    { name: 'Kore', description: 'Warm and friendly', emoji: '😊' },
    { name: 'Charon', description: 'Deep and authoritative', emoji: '🎭' },
    { name: 'Fenrir', description: 'Strong and confident', emoji: '💪' },
    { name: 'Aoede', description: 'Melodic and expressive', emoji: '🎵' },
    { name: 'Puck', description: 'Playful and energetic', emoji: '⚡' }
  ];

  // Available languages for TTS (expanded with local languages)
  const languages = [
    { code: 'yo', name: 'Yoruba', flag: '🇳🇬', category: 'African' },
    { code: 'ha', name: 'Hausa', flag: '🇳🇬', category: 'African' },
    { code: 'ig', name: 'Igbo', flag: '🇳🇬', category: 'African' },
    { code: 'en', name: 'English', flag: '🇺🇸', category: 'Popular' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', category: 'Popular' },
    { code: 'fr', name: 'French', flag: '🇫🇷', category: 'Popular' },
    { code: 'de', name: 'German', flag: '🇩🇪', category: 'European' },
    { code: 'it', name: 'Italian', flag: '🇮🇹', category: 'European' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹', category: 'Popular' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺', category: 'European' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', category: 'Asian' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', category: 'Asian' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', category: 'Asian' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', category: 'Asian' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', category: 'Other' },
    { code: 'sw', name: 'Swahili', flag: '🇰🇪', category: 'African' },
    { code: 'zu', name: 'Zulu', flag: '🇿🇦', category: 'African' },
    { code: 'af', name: 'Afrikaans', flag: '🇿🇦', category: 'African' },
    { code: 'am', name: 'Amharic', flag: '🇪🇹', category: 'African' },
    { code: 'th', name: 'Thai', flag: '🇹🇭', category: 'Asian' },
    { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', category: 'Asian' },
    { code: 'id', name: 'Indonesian', flag: '🇮🇩', category: 'Asian' },
    { code: 'ms', name: 'Malay', flag: '🇲🇾', category: 'Asian' },
    { code: 'tl', name: 'Filipino', flag: '🇵🇭', category: 'Asian' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱', category: 'European' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱', category: 'European' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷', category: 'European' },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪', category: 'European' },
    { code: 'da', name: 'Danish', flag: '🇩🇰', category: 'European' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴', category: 'European' },
    { code: 'qu', name: 'Quechua', flag: '🇵🇪', category: 'Other' },
    { code: 'gn', name: 'Guarani', flag: '🇵🇾', category: 'Other' }
  ];

  // Group languages by category
  const languageCategories = {
    Popular: languages.filter(l => l.category === 'Popular'),
    African: languages.filter(l => l.category === 'African'),
    Asian: languages.filter(l => l.category === 'Asian'),
    European: languages.filter(l => l.category === 'European'),
    Other: languages.filter(l => l.category === 'Other')
  };

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
    setTranslatedText(""); // Clear previous translation

    try {
      console.log("Generating audio with voice:", selectedVoice, "language:", selectedLanguage);
      
      let finalText = text;
      
      // If not English, translate the text first
      if (selectedLanguage !== 'en') {
        console.log("Translating text to", selectedLanguage);
        const languageName = languages.find(l => l.code === selectedLanguage)?.name || 'the selected language';
        
        // First, translate the text using Gemini
        const translationResult = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ 
            parts: [{ 
              text: `Translate the following text to ${languageName}. Only return the translation, nothing else: "${text}"` 
            }] 
          }]
        });
        
        console.log("Translation result:", translationResult);
        
        // Access the translated text correctly
        const translatedTextResult = translationResult.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (translatedTextResult) {
          finalText = translatedTextResult;
          setTranslatedText(translatedTextResult); // Store for display
          console.log("Translated text:", finalText);
        } else {
          console.error("Translation failed, using original text");
          finalText = text; // Fallback to original text
          setTranslatedText("Translation failed - using original text");
        }
      } else {
        // For English, clear any previous translation
        setTranslatedText("");
      }

      console.log("Generating TTS with text:", finalText);
      
      // Now generate speech with the translated text
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: finalText }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { 
                voiceName: selectedVoice
              },
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
    "Read this like storytelling: Once upon a time, in a land far away...",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-6 shadow-lg">
            <span className="text-3xl">🎵</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            AI Speech Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your text into natural-sounding speech in 30+ languages with AI-powered translation and voice synthesis
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-2 space-y-8">
            {/* Voice Selection */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-xl">🎤</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Voice Selection</h3>
              </div>
              <p className="text-gray-600 mb-4">Choose a voice personality for your speech generation</p>
              <div className="grid md:grid-cols-2 gap-3">
                {voices.map((voice) => (
                  <label key={voice.name} className="group">
                    <input
                      type="radio"
                      name="voice"
                      value={voice.name}
                      checked={selectedVoice === voice.name}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedVoice === voice.name 
                        ? 'border-purple-500 bg-purple-50 shadow-md' 
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                    }`}>
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{voice.emoji}</span>
                        <div>
                          <div className="font-medium text-gray-800">{voice.name}</div>
                          <div className="text-sm text-gray-600">{voice.description}</div>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-xl">🌍</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Language & Translation</h3>
              </div>
              <p className="text-gray-600 mb-6">Choose target language - your text will be automatically translated</p>
              
              {Object.entries(languageCategories).map(([category, langs]) => (
                <div key={category} className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">{category} Languages</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {langs.map((language) => (
                      <label key={language.code} className="group">
                        <input
                          type="radio"
                          name="language"
                          value={language.code}
                          checked={selectedLanguage === language.code}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedLanguage === language.code 
                            ? 'border-green-500 bg-green-50 shadow-md' 
                            : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                        }`}>
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{language.flag}</span>
                            <span className="text-sm font-medium text-gray-800">{language.name}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-start">
                  <span className="text-xl mr-3">💡</span>
                  <div className="text-sm">
                    <p className="font-medium text-gray-800 mb-1">How Translation Works</p>
                    <p className="text-gray-600">Enter text in any language (typically English). When you select a different target language, your text will be automatically translated before being converted to speech.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Input */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-xl">✍️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Text Input</h3>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <textarea
                    id="text-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter your text here... It will be automatically translated to your selected language and converted to speech."
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                    rows={4}
                    disabled={loading}
                  />
                  <div className="mt-3 flex justify-between items-center text-sm text-gray-600">
                    <span>Characters: {text.length} / 500</span>
                    {selectedLanguage !== 'en' && (
                      <span className="text-blue-600 font-medium">
                        ⚡ Will translate to {languages.find(l => l.code === selectedLanguage)?.name}
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !text.trim()}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                      {selectedLanguage !== 'en' ? "Translating & Generating..." : "Generating Speech..."}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="text-xl mr-2">🎵</span>
                      Generate Speech
                    </div>
                  )}
                </button>
                
                <div className="mt-3 text-center text-sm text-gray-600">
                  Voice: <span className="font-semibold text-purple-600">{selectedVoice}</span> • 
                  Language: <span className="font-semibold text-green-600">{languages.find(l => l.code === selectedLanguage)?.name}</span>
                </div>
              </form>
            </div>

            {/* Sample Prompts */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-xl">💡</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Sample Prompts</h3>
              </div>
              <p className="text-gray-600 mb-4">Try these examples to get started</p>
              <div className="grid gap-2">
                {samplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setText(prompt)}
                    className="text-left p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200 text-sm"
                  >
                        &quot;{prompt}&quot;
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">❌</span>
                  <h3 className="text-lg font-semibold text-red-800">Error</h3>
                </div>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Generated Audio */}
            {generatedAudio && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">🎵</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Generated Speech</h3>
                </div>

                {/* Translation Display */}
                {translatedText && selectedLanguage !== 'en' && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                      <span className="text-lg mr-2">🔄</span>
                      Translation
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Original (English)</span>
                        <p className="text-gray-700 bg-white/70 p-3 rounded-lg border">{text}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                          Translated ({languages.find(l => l.code === selectedLanguage)?.name})
                        </span>
                        <p className="text-gray-800 bg-blue-50 p-3 rounded-lg border border-blue-200 font-medium">{translatedText}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Audio Player */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="text-lg mr-2">🔊</span>
                    Audio Player
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                    <audio
                      controls
                      className="w-full"
                      src={generatedAudio.url}
                      preload="metadata"
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>

                {/* Audio Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Audio Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Voice:</span>
                      <span className="font-medium">{selectedVoice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language:</span>
                      <span className="font-medium">{languages.find(l => l.code === selectedLanguage)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Format:</span>
                      <span className="font-medium">WAV Audio</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">~{Math.ceil(text.length / 10)}s</span>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={() => downloadAudio(generatedAudio.data, `speech-${selectedVoice.toLowerCase()}-${selectedLanguage}-${Date.now()}.wav`)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg"
                >
                  <div className="flex items-center justify-center">
                    <span className="text-lg mr-2">📥</span>
                    Download Audio
                  </div>
                </button>
              </div>
            )}

            {/* Empty State */}
            {!generatedAudio && !loading && !error && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🎤</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Generate Speech</h3>
                <p className="text-gray-600 mb-4">Enter your text, select a voice and language, then click generate to create natural-sounding speech.</p>
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-gray-700">
                    💡 <strong>Pro tip:</strong> Add emotion instructions like &quot;Say cheerfully:&quot; or &quot;Read dramatically:&quot; for better results!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mr-4">
              <span className="text-2xl">💡</span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800">Tips for Better Results</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">🎭 Add Emotion</h4>
              <p className="text-sm text-purple-700">Use instructions like &quot;Say cheerfully:&quot;, &quot;Read sadly:&quot;, or &quot;Speak with excitement:&quot; to control tone.</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">📝 Use Punctuation</h4>
              <p className="text-sm text-blue-700">Add commas, periods, and exclamation marks for natural pauses and emphasis in speech.</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">🌍 Translation Tips</h4>
              <p className="text-sm text-green-700">Keep sentences clear and simple for better translation accuracy across different languages.</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">📏 Optimal Length</h4>
              <p className="text-sm text-orange-700">Keep text between 50-500 characters for the best speech generation quality and performance.</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border border-pink-200">
              <h4 className="font-semibold text-pink-800 mb-2">🎪 Add Context</h4>
              <p className="text-sm text-pink-700">Include context like &quot;Read like a news anchor:&quot; or &quot;Say like telling a story:&quot; for better delivery.</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
              <h4 className="font-semibold text-indigo-800 mb-2">🎵 Voice Matching</h4>
              <p className="text-sm text-indigo-700">Try different voices for different content types - authoritative for news, playful for stories.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}