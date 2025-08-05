import React, { useState } from 'react';
import { WardrobeItem, StyleProfile, OutfitSuggestion } from '../../types/wardrobe';
import { geminiService } from '../../services/geminiApi';
import { Sparkles, Cloud, Sun, CloudRain, Snowflake } from 'lucide-react';
import OutfitCard from './OutfitCard';

interface OutfitGeneratorProps {
  wardrobeItems: WardrobeItem[];
  styleProfile: StyleProfile | null;
}

const OutfitGenerator: React.FC<OutfitGeneratorProps> = ({ wardrobeItems, styleProfile }) => {
  const [selectedOccasion, setSelectedOccasion] = useState<string>('casual');
  const [selectedWeather, setSelectedWeather] = useState<string>('mild');
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const occasions = [
    { value: 'casual', label: 'Casual' },
    { value: 'work', label: 'Work' },
    { value: 'formal', label: 'Formal' },
    { value: 'party', label: 'Party' },
    { value: 'date', label: 'Date' },
    { value: 'athletic', label: 'Athletic' },
    { value: 'vacation', label: 'Vacation' }
  ];

  const weatherOptions = [
    { value: 'hot', label: 'Hot', icon: Sun },
    { value: 'mild', label: 'Mild', icon: Cloud },
    { value: 'cool', label: 'Cool', icon: CloudRain },
    { value: 'cold', label: 'Cold', icon: Snowflake }
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

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Generate Outfit Suggestions</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Occasion
            </label>
            <select
              value={selectedOccasion}
              onChange={(e) => setSelectedOccasion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {occasions.map(occasion => (
                <option key={occasion.value} value={occasion.value}>
                  {occasion.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weather
            </label>
            <div className="grid grid-cols-4 gap-2">
              {weatherOptions.map(weather => {
                const Icon = weather.icon;
                return (
                  <button
                    key={weather.value}
                    onClick={() => setSelectedWeather(weather.value)}
                    className={`flex flex-col items-center p-2 rounded-lg border-2 transition-colors ${
                      selectedWeather === weather.value
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span className="text-xs">{weather.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={generateOutfits}
          disabled={isGenerating}
          className="mt-6 flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="h-5 w-5" />
          <span>{isGenerating ? 'Generating...' : 'Generate Outfits'}</span>
        </button>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Outfit Suggestions</h3>
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
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Wardrobe Items</h3>
          <p className="text-gray-500">Add some clothing items to your wardrobe to get started with outfit suggestions!</p>
        </div>
      )}
    </div>
  );
};

export default OutfitGenerator; 