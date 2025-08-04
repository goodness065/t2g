import React, { useState } from 'react';
import { WardrobeItem, StyleProfile, OutfitSuggestion } from '../../types/wardrobe';
import { geminiService } from '../../services/geminiApi';
import { Sparkles, Cloud, Sun, CloudRain, Snowflake, Zap, Star, Calendar } from 'lucide-react';
import OutfitCard from './OutfitCard';
import WeeklyOutfitPlanner from './WeeklyOutfitPlanner';

interface OutfitGeneratorProps {
  wardrobeItems: WardrobeItem[];
  styleProfile: StyleProfile | null;
}

const OutfitGenerator: React.FC<OutfitGeneratorProps> = ({ wardrobeItems, styleProfile }) => {
  const [selectedOccasion, setSelectedOccasion] = useState<string>('casual');
  const [selectedWeather, setSelectedWeather] = useState<string>('mild');
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [plannerMode, setPlannerMode] = useState<'single' | 'weekly'>('single');

  const occasions = [
    { value: 'casual', label: 'Casual', emoji: '👕', color: 'from-blue-500 to-blue-600' },
    { value: 'work', label: 'Work', emoji: '💼', color: 'from-indigo-500 to-indigo-600' },
    { value: 'formal', label: 'Formal', emoji: '🤵', color: 'from-purple-500 to-purple-600' },
    { value: 'party', label: 'Party', emoji: '🎉', color: 'from-pink-500 to-pink-600' },
    { value: 'date', label: 'Date', emoji: '💕', color: 'from-rose-500 to-rose-600' },
    { value: 'athletic', label: 'Athletic', emoji: '🏃', color: 'from-green-500 to-green-600' },
    { value: 'vacation', label: 'Vacation', emoji: '🏖️', color: 'from-yellow-500 to-orange-500' }
  ];

  const weatherOptions = [
    { value: 'hot', label: 'Hot', icon: Sun, color: 'from-orange-500 to-red-500' },
    { value: 'mild', label: 'Mild', icon: Cloud, color: 'from-blue-400 to-blue-500' },
    { value: 'cool', label: 'Cool', icon: CloudRain, color: 'from-gray-500 to-gray-600' },
    { value: 'cold', label: 'Cold', icon: Snowflake, color: 'from-cyan-400 to-blue-600' }
  ];

  const generateOutfits = async () => {
    if (wardrobeItems.length === 0) {
      alert('Please add some items to your wardrobe first!');
      return;
    }

    setIsGenerating(true);
    try {
      const outfitSuggestions = await geminiService.generateOutfitSuggestions(
        wardrobeItems,
        selectedOccasion,
        selectedWeather,
        styleProfile || undefined
      );
      setSuggestions(outfitSuggestions);
    } catch (error) {
      console.error('Error generating outfits:', error);
      alert('Error generating outfits. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedOccasionData = occasions.find(o => o.value === selectedOccasion);
  const selectedWeatherData = weatherOptions.find(w => w.value === selectedWeather);

  return (
    <div className="space-y-8">
      {/* Mode Toggle */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-pink-600 to-purple-600 rounded-2xl shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Outfit Planning</h3>
              <p className="text-gray-600">Create perfect outfits for any occasion</p>
            </div>
          </div>
          
          <div className="flex bg-gray-100 rounded-2xl p-1 shadow-inner">
            <button
              onClick={() => setPlannerMode('single')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                plannerMode === 'single'
                  ? 'bg-white text-gray-900 shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>Single Outfit</span>
            </button>
            <button
              onClick={() => setPlannerMode('weekly')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                plannerMode === 'weekly'
                  ? 'bg-white text-gray-900 shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Weekly Planner</span>
            </button>
          </div>
        </div>
      </div>

      {plannerMode === 'single' ? (
        <>
          {/* Controls */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Generate Outfit Suggestions</h3>
                <p className="text-gray-600 text-sm">Select your preferences and let AI create perfect outfits</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Occasion Selection */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-4">
                  Occasion
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {occasions.map(occasion => (
                    <button
                      key={occasion.value}
                      onClick={() => setSelectedOccasion(occasion.value)}
                      className={`group relative overflow-hidden p-4 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 ${
                        selectedOccasion === occasion.value
                          ? 'border-transparent shadow-xl'
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-lg'
                      }`}
                    >
                      {selectedOccasion === occasion.value && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${occasion.color} opacity-10`}></div>
                      )}
                      <div className="relative flex items-center space-x-3">
                        <span className="text-2xl">{occasion.emoji}</span>
                        <span className={`font-semibold ${
                          selectedOccasion === occasion.value
                            ? 'text-gray-900'
                            : 'text-gray-700'
                        }`}>
                          {occasion.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather Selection */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-4">
                  Weather
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {weatherOptions.map(weather => {
                    const Icon = weather.icon;
                    return (
                      <button
                        key={weather.value}
                        onClick={() => setSelectedWeather(weather.value)}
                        className={`group relative overflow-hidden p-4 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 ${
                          selectedWeather === weather.value
                            ? 'border-transparent shadow-xl'
                            : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-lg'
                        }`}
                      >
                        {selectedWeather === weather.value && (
                          <div className={`absolute inset-0 bg-gradient-to-br ${weather.color} opacity-10`}></div>
                        )}
                        <div className="relative flex items-center space-x-3">
                          <div className={`p-2 rounded-xl ${
                            selectedWeather === weather.value
                              ? `bg-gradient-to-br ${weather.color}`
                              : 'bg-gray-100'
                          }`}>
                            <Icon className={`h-5 w-5 ${
                              selectedWeather === weather.value ? 'text-white' : 'text-gray-600'
                            }`} />
                          </div>
                          <span className={`font-semibold ${
                            selectedWeather === weather.value
                              ? 'text-gray-900'
                              : 'text-gray-700'
                          }`}>
                            {weather.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Options Display */}
            <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{selectedOccasionData?.emoji}</span>
                    <span className="font-semibold text-gray-700">
                      {selectedOccasionData?.label} outfit
                    </span>
                  </div>
                  <div className="w-px h-6 bg-gray-300"></div>
                  <div className="flex items-center space-x-2">
                    {selectedWeatherData && (
                      <>
                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${selectedWeatherData.color}`}>
                          <selectedWeatherData.icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold text-gray-700">
                          {selectedWeatherData.label} weather
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={generateOutfits}
                  disabled={isGenerating}
                  className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Sparkles className="h-5 w-5" />
                  <span>{isGenerating ? 'Generating...' : 'Generate Outfits'}</span>
                  {isGenerating && (
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl animate-pulse"></div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Your Perfect Outfits
                </h3>
                <p className="text-gray-600">
                  AI-curated outfits for {selectedOccasionData?.label.toLowerCase()} occasions in {selectedWeatherData?.label.toLowerCase()} weather
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.map((suggestion, index) => (
                  <OutfitCard
                    key={index}
                    suggestion={suggestion}
                    wardrobeItems={wardrobeItems}
                  />
                ))}
              </div>
            </div>
          )}

          {wardrobeItems.length === 0 && (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border-2 border-dashed border-gray-300">
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-gray-200 rounded-2xl inline-block mb-6">
                  <Sparkles className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-3">No Wardrobe Items</h3>
                <p className="text-gray-500 leading-relaxed">
                  Add some clothing items to your wardrobe to get started with AI-powered outfit suggestions!
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <WeeklyOutfitPlanner 
          wardrobeItems={wardrobeItems}
          styleProfile={styleProfile}
        />
      )}
    </div>
  );
};

export default OutfitGenerator;