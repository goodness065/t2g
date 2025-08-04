"use client"
import { GoogleGenAI } from "@google/genai";
import { useState } from "react";
import { Mic, Volume2, Download, Play, Globe, Sparkles, Zap, Languages, Music, Star, Heart } from 'lucide-react';

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
    { name: 'Kore', description: 'Warm and friendly', emoji: '😊', color: 'from-pink-500 to-rose-600' },
    { name: 'Charon', description: 'Deep and authoritative', emoji: '🎭', color: 'from-gray-600 to-gray-700' },
    { name: 'Fenrir', description: 'Strong and confident', emoji: '💪', color: 'from-orange-500 to-red-600' },
    { name: 'Aoede', description: 'Melodic and expressive', emoji: '🎵', color: 'from-purple-500 to-violet-600' },
    { name: 'Puck', description: 'Playful and energetic', emoji: '⚡', color: 'from-yellow-500 to-orange-500' }
  ];

  // Available languages for TTS with accent information
  const languages = [
    { code: 'yo', name: 'Yoruba', flag: '🇳🇬', category: 'African', accent: 'Nigerian Yoruba accent', culturalPrompt: 'with traditional Yoruba pronunciation and tonal patterns' },
    { code: 'ha', name: 'Hausa', flag: '🇳🇬', category: 'African', accent: 'Northern Nigerian Hausa accent', culturalPrompt: 'with authentic Hausa pronunciation and rhythm' },
    { code: 'ig', name: 'Igbo', flag: '🇳🇬', category: 'African', accent: 'Nigerian Igbo accent', culturalPrompt: 'with traditional Igbo tonal pronunciation' },
    { code: 'en', name: 'English', flag: '🇺🇸', category: 'Popular', accent: 'American English', culturalPrompt: 'with clear American pronunciation' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', category: 'Popular', accent: 'Iberian Spanish accent', culturalPrompt: 'with authentic Spanish pronunciation' },
    { code: 'fr', name: 'French', flag: '🇫🇷', category: 'Popular', accent: 'Parisian French accent', culturalPrompt: 'with refined French pronunciation' },
    { code: 'de', name: 'German', flag: '🇩🇪', category: 'European', accent: 'Standard German accent', culturalPrompt: 'with clear German pronunciation' },
    { code: 'it', name: 'Italian', flag: '🇮🇹', category: 'European', accent: 'Standard Italian accent', culturalPrompt: 'with melodic Italian pronunciation' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹', category: 'Popular', accent: 'European Portuguese accent', culturalPrompt: 'with authentic Portuguese pronunciation' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺', category: 'European', accent: 'Moscow Russian accent', culturalPrompt: 'with clear Russian pronunciation' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', category: 'Asian', accent: 'Tokyo Japanese accent', culturalPrompt: 'with proper Japanese pronunciation and rhythm' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', category: 'Asian', accent: 'Seoul Korean accent', culturalPrompt: 'with authentic Korean pronunciation' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', category: 'Asian', accent: 'Mandarin Chinese accent', culturalPrompt: 'with proper Mandarin tones and pronunciation' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', category: 'Asian', accent: 'Standard Hindi accent', culturalPrompt: 'with authentic Hindi pronunciation' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', category: 'Other', accent: 'Modern Standard Arabic accent', culturalPrompt: 'with classical Arabic pronunciation' },
    { code: 'sw', name: 'Swahili', flag: '🇰🇪', category: 'African', accent: 'Kenyan Swahili accent', culturalPrompt: 'with authentic East African Swahili pronunciation' },
    { code: 'zu', name: 'Zulu', flag: '🇿🇦', category: 'African', accent: 'South African Zulu accent', culturalPrompt: 'with traditional Zulu click sounds and pronunciation' },
    { code: 'af', name: 'Afrikaans', flag: '🇿🇦', category: 'African', accent: 'South African Afrikaans accent', culturalPrompt: 'with authentic Afrikaans pronunciation' },
    { code: 'am', name: 'Amharic', flag: '🇪🇹', category: 'African', accent: 'Ethiopian Amharic accent', culturalPrompt: 'with traditional Ethiopian pronunciation' },
    { code: 'th', name: 'Thai', flag: '🇹🇭', category: 'Asian', accent: 'Bangkok Thai accent', culturalPrompt: 'with proper Thai tonal pronunciation' },
    { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', category: 'Asian', accent: 'Northern Vietnamese accent', culturalPrompt: 'with authentic Vietnamese tonal patterns' },
    { code: 'id', name: 'Indonesian', flag: '🇮🇩', category: 'Asian', accent: 'Jakarta Indonesian accent', culturalPrompt: 'with clear Indonesian pronunciation' },
    { code: 'ms', name: 'Malay', flag: '🇲🇾', category: 'Asian', accent: 'Malaysian Malay accent', culturalPrompt: 'with authentic Malay pronunciation' },
    { code: 'tl', name: 'Filipino', flag: '🇵🇭', category: 'Asian', accent: 'Manila Filipino accent', culturalPrompt: 'with Filipino pronunciation patterns' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱', category: 'European', accent: 'Netherlands Dutch accent', culturalPrompt: 'with clear Dutch pronunciation' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱', category: 'European', accent: 'Warsaw Polish accent', culturalPrompt: 'with authentic Polish pronunciation' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷', category: 'European', accent: 'Istanbul Turkish accent', culturalPrompt: 'with proper Turkish pronunciation' },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪', category: 'European', accent: 'Stockholm Swedish accent', culturalPrompt: 'with melodic Swedish pronunciation' },
    { code: 'da', name: 'Danish', flag: '🇩🇰', category: 'European', accent: 'Copenhagen Danish accent', culturalPrompt: 'with authentic Danish pronunciation' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴', category: 'European', accent: 'Oslo Norwegian accent', culturalPrompt: 'with clear Norwegian pronunciation' },
    { code: 'qu', name: 'Quechua', flag: '🇵🇪', category: 'Other', accent: 'Andean Quechua accent', culturalPrompt: 'with traditional Andean pronunciation patterns' },
    { code: 'gn', name: 'Guarani', flag: '🇵🇾', category: 'Other', accent: 'Paraguayan Guarani accent', culturalPrompt: 'with indigenous Guarani pronunciation' }
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
      
      // Add cultural/accent prompt for authentic pronunciation
      const selectedLang = languages.find(l => l.code === selectedLanguage);
      let enhancedText = finalText;
      
      if (selectedLang && selectedLang.culturalPrompt) {
        enhancedText = `Please speak this ${selectedLang.culturalPrompt}: ${finalText}`;
        console.log("Enhanced with cultural prompt:", enhancedText);
      }
      
      // Now generate speech with the translated text
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: enhancedText }] }],
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
    { text: "Say cheerfully: Have a wonderful day!", emoji: "😊", category: "Emotional" },
    { text: "Read this like a news anchor: Breaking news from the tech world today.", emoji: "📺", category: "Professional" },
    { text: "Speak in a calm, meditative voice: Take a deep breath and relax.", emoji: "🧘", category: "Calming" },
    { text: "Say with excitement: Congratulations on your amazing achievement!", emoji: "🎉", category: "Celebratory" },
    { text: "Read this like storytelling: Once upon a time, in a land far away...", emoji: "📚", category: "Narrative" },
  ];

  const selectedVoiceData = voices.find(v => v.name === selectedVoice);
  const selectedLanguageData = languages.find(l => l.code === selectedLanguage);

  return (
    <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        {/* Left Column - Controls */}
        <div className="space-y-8">
          {/* Voice Selection */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl shadow-lg">
                <Mic className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Voice Selection</h3>
                <p className="text-gray-600">Choose the perfect voice personality for your content</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {voices.map((voice) => (
                <label key={voice.name} className="group cursor-pointer">
                  <input
                    type="radio"
                    name="voice"
                    value={voice.name}
                    checked={selectedVoice === voice.name}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 ${
                    selectedVoice === voice.name 
                      ? 'border-transparent shadow-xl' 
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-lg'
                  }`}>
                    {selectedVoice === voice.name && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${voice.color} opacity-10`}></div>
                    )}
                    <div className="relative flex items-center space-x-4">
                      <div className={`text-3xl p-3 rounded-xl ${
                        selectedVoice === voice.name 
                          ? `bg-gradient-to-br ${voice.color} text-white shadow-lg` 
                          : 'bg-gray-100'
                      }`}>
                        {voice.emoji}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-gray-900">{voice.name}</div>
                        <div className="text-gray-600">{voice.description}</div>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Language & Translation</h3>
                <p className="text-gray-600">Your text will be automatically translated with authentic pronunciation</p>
              </div>
            </div>
            
            {Object.entries(languageCategories).map(([category, langs]) => (
              <div key={category} className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                  <Languages className="h-5 w-5 text-blue-600" />
                  <h4 className="text-lg font-bold text-gray-800">{category} Languages</h4>
                  <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {langs.map((language) => (
                    <label key={language.code} className="group cursor-pointer">
                      <input
                        type="radio"
                        name="language"
                        value={language.code}
                        checked={selectedLanguage === language.code}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`relative overflow-hidden p-4 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 ${
                        selectedLanguage === language.code 
                          ? 'border-blue-500 bg-blue-50 shadow-xl' 
                          : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-lg'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{language.flag}</span>
                            <span className="font-semibold text-gray-800">{language.name}</span>
                          </div>
                          {language.accent && (
                            <span className="text-blue-500">
                              <Music className="h-4 w-4" />
                            </span>
                          )}
                        </div>
                        {language.accent && selectedLanguage === language.code && (
                          <div className="mt-3 text-xs text-blue-700 bg-blue-100 px-3 py-2 rounded-xl font-medium">
                            {language.accent}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">Cultural Voice Enhancement</h4>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    Each language includes authentic accent and pronunciation guidance. Yoruba includes tonal patterns, 
                    Zulu includes click sounds, Chinese includes proper Mandarin tones, and more for natural-sounding speech.
                  </p>
                </div>
              </div>
            </div>
          </div>

           {/* Sample Prompts */}
           <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Sample Prompts</h3>
                <p className="text-gray-600">Try these examples to get started with emotional speech</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {samplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setText(prompt.text)}
                  className="group text-left p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-yellow-50 hover:to-orange-50 border-2 border-gray-200 hover:border-yellow-300 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{prompt.emoji}</div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        {prompt.category}
                      </div>
                      <p className="text-gray-800 font-medium leading-relaxed">&quot;{prompt.text}&quot;</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Text Input */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Text Input</h3>
                <p className="text-gray-600">Enter your text and watch AI bring it to life</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <textarea
                  id="text-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter your text here... Add emotion instructions like 'Say cheerfully:' or 'Read dramatically:' for better results!"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 resize-none transition-all duration-300 text-lg"
                  rows={5}
                  disabled={loading}
                />
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`font-medium ${text.length > 450 ? 'text-red-600' : 'text-gray-600'}`}>
                      {text.length} / 500 characters
                    </span>
                    {selectedLanguage !== 'en' && (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Languages className="h-4 w-4" />
                        <span className="font-medium">
                          Will translate to {selectedLanguageData?.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected Options Display */}
              <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${selectedVoiceData?.color}`}>
                        <span className="text-white text-lg">{selectedVoiceData?.emoji}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Voice</span>
                        <p className="font-bold text-gray-900">{selectedVoiceData?.name}</p>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-gray-300"></div>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{selectedLanguageData?.flag}</span>
                      <div>
                        <span className="text-sm text-gray-600">Language</span>
                        <p className="font-bold text-gray-900">{selectedLanguageData?.name}</p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading || !text.trim()}
                    className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                        <span>{selectedLanguage !== 'en' ? "Translating & Generating..." : "Generating Speech..."}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-6 w-6" />
                        <span>Generate Speech</span>
                        <Sparkles className="h-5 w-5 opacity-70" />
                      </>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-50 -z-10 group-hover:opacity-70 transition-opacity"></div>
                  </button>
                </div>
              </div>
            </form>
          </div>

         
        </div>

        {/* Right Column - Results */}
        <div className="space-y-8">
          {/* Error Display */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-3xl p-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-red-100 rounded-2xl">
                  <span className="text-2xl">❌</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-800">Error</h3>
                  <p className="text-red-600 text-sm">Something went wrong</p>
                </div>
              </div>
              <p className="text-red-700 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Generated Audio */}
          {generatedAudio && (
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg">
                  <Volume2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Generated Speech</h3>
                  <p className="text-gray-600">Your AI-generated audio is ready</p>
                </div>
              </div>

              {/* Translation Display */}
              {translatedText && selectedLanguage !== 'en' && (
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <Languages className="h-6 w-6 text-blue-600" />
                    <h4 className="text-lg font-bold text-blue-800">Translation</h4>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">
                        Original (English)
                      </span>
                      <p className="text-gray-700 bg-white/70 p-4 rounded-xl border border-gray-200">{text}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wide block mb-2">
                        Translated ({selectedLanguageData?.name})
                      </span>
                      <p className="text-gray-800 bg-blue-50 p-4 rounded-xl border border-blue-200 font-medium">{translatedText}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Player */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Play className="h-6 w-6 text-green-600" />
                  <h4 className="text-lg font-bold text-gray-800">Audio Player</h4>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200">
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
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 mb-8 border border-emerald-200">
                <h4 className="text-lg font-bold text-emerald-800 mb-4 flex items-center space-x-2">
                  <Music className="h-5 w-5" />
                  <span>Audio Information</span>
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Voice:</span>
                    <span className="font-bold text-emerald-800">{selectedVoice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Language:</span>
                    <span className="font-bold text-emerald-800">{selectedLanguageData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Format:</span>
                    <span className="font-bold text-emerald-800">WAV Audio</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Duration:</span>
                    <span className="font-bold text-emerald-800">~{Math.ceil(text.length / 10)}s</span>
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={() => downloadAudio(generatedAudio.data, `speech-${selectedVoice.toLowerCase()}-${selectedLanguage}-${Date.now()}.wav`)}
                className="group relative w-full inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Download className="h-6 w-6" />
                <span>Download Audio</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-50 -z-10 group-hover:opacity-70 transition-opacity"></div>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!generatedAudio && !loading && !error && (
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 text-center">
              <div className="p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl inline-block mb-6">
                <Mic className="h-16 w-16 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Generate Speech</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Enter your text, select a voice and language, then click generate to create natural-sounding speech with AI.
              </p>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center space-x-3 mb-2">
                  <Heart className="h-5 w-5 text-green-600" />
                  <span className="font-bold text-green-800">Pro Tips</span>
                </div>
                <p className="text-green-700 text-sm leading-relaxed">
                  Add emotion instructions like &quot;Say cheerfully:&quot; or &quot;Read dramatically:&quot; 
                  for more expressive results. Try different voices to match your content style!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-16 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg">
            <Star className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-900">Pro Tips for Amazing Results</h3>
            <p className="text-gray-600">Master the art of AI speech generation</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-3xl mb-4">🎭</div>
            <h4 className="font-bold text-purple-800 mb-3 text-lg">Add Emotion & Context</h4>
            <p className="text-purple-700 leading-relaxed">
              Use instructions like &quot;Say cheerfully:&quot;, &quot;Read sadly:&quot;, or &quot;Speak with excitement:&quot; to control tone and emotion.
            </p>
          </div>
          
          <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-3xl mb-4">📝</div>
            <h4 className="font-bold text-blue-800 mb-3 text-lg">Perfect Punctuation</h4>
            <p className="text-blue-700 leading-relaxed">
              Add commas, periods, and exclamation marks for natural pauses and emphasis in speech generation.
            </p>
          </div>
          
          <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-3xl mb-4">🌍</div>
            <h4 className="font-bold text-green-800 mb-3 text-lg">Translation Magic</h4>
            <p className="text-green-700 leading-relaxed">
              Keep sentences clear and simple for better translation accuracy across 30+ different languages.
            </p>
          </div>
          
          <div className="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-3xl mb-4">📏</div>
            <h4 className="font-bold text-orange-800 mb-3 text-lg">Optimal Length</h4>
            <p className="text-orange-700 leading-relaxed">
              Keep text between 50-500 characters for the best speech generation quality and optimal performance.
            </p>
          </div>
          
          <div className="group bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border border-pink-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-3xl mb-4">🎪</div>
            <h4 className="font-bold text-pink-800 mb-3 text-lg">Context is King</h4>
            <p className="text-pink-700 leading-relaxed">
              Include context like &quot;Read like a news anchor:&quot; or &quot;Say like telling a story:&quot; for better delivery style.
            </p>
          </div>
          
          <div className="group bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 border border-indigo-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-3xl mb-4">🎵</div>
            <h4 className="font-bold text-indigo-800 mb-3 text-lg">Voice Matching</h4>
            <p className="text-indigo-700 leading-relaxed">
              Try different voices for different content types - authoritative for news, playful for children&apos;s stories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}