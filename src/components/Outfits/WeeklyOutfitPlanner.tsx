import React, { useState } from 'react';
import { WardrobeItem, StyleProfile, OutfitSuggestion } from '../../types/wardrobe';
import { geminiService } from '../../services/geminiApi';
import { Calendar, Sparkles, RefreshCw, Briefcase, Star, Coffee } from 'lucide-react';
import OutfitCard from './OutfitCard';

interface WeeklyOutfitPlannerProps {
  wardrobeItems: WardrobeItem[];
  styleProfile: StyleProfile | null;
}

interface WeeklyPlan {
  [key: string]: OutfitSuggestion;
}

const WeeklyOutfitPlanner: React.FC<WeeklyOutfitPlannerProps> = ({ 
  wardrobeItems, 
  styleProfile 
}) => {
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [workStyle, setWorkStyle] = useState<string>('business_casual');

  const weekdays = [
    { key: 'monday', label: 'Monday', emoji: '💼', color: 'from-blue-500 to-blue-600' },
    { key: 'tuesday', label: 'Tuesday', emoji: '⚡', color: 'from-purple-500 to-purple-600' },
    { key: 'wednesday', label: 'Wednesday', emoji: '🎯', color: 'from-green-500 to-green-600' },
    { key: 'thursday', label: 'Thursday', emoji: '🚀', color: 'from-orange-500 to-orange-600' },
    { key: 'friday', label: 'Friday', emoji: '🎉', color: 'from-pink-500 to-pink-600' }
  ];

  const workStyles = [
    { 
      value: 'business_casual', 
      label: 'Business Casual',
      emoji: '👔',
      description: 'Professional yet comfortable',
      color: 'from-blue-600 to-indigo-600'
    },
    { 
      value: 'formal', 
      label: 'Formal/Corporate',
      emoji: '🤵',
      description: 'Traditional corporate attire',
      color: 'from-gray-700 to-gray-800'
    },
    { 
      value: 'casual', 
      label: 'Casual Workplace',
      emoji: '👕',
      description: 'Relaxed and comfortable',
      color: 'from-green-600 to-emerald-600'
    },
    { 
      value: 'creative', 
      label: 'Creative/Relaxed',
      emoji: '🎨',
      description: 'Express your personality',
      color: 'from-purple-600 to-pink-600'
    }
  ];

  const generateWeeklyOutfits = async () => {
    if (wardrobeItems.length === 0) {
      alert('Please add some items to your wardrobe first!');
      return;
    }

    setIsGenerating(true);
    try {
      const weeklyOutfits = await geminiService.generateWeeklyOutfits(
        wardrobeItems,
        workStyle,
        'mild', // Default weather, could be made configurable
        styleProfile || undefined
      );
      
      setWeeklyPlan(weeklyOutfits);
    } catch (error) {
      console.error('Error generating weekly outfits:', error);
      alert('Error generating weekly outfits. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateDay = async (dayKey: string) => {
    setIsGenerating(true);
    try {
      const outfitSuggestions = await geminiService.generateOutfitSuggestions(
        wardrobeItems,
        workStyle,
        'mild',
        styleProfile || undefined
      );
      
      if (outfitSuggestions.length > 0) {
        setWeeklyPlan(prev => ({
          ...prev,
          [dayKey]: outfitSuggestions[0]
        }));
      }
    } catch (error) {
      console.error('Error regenerating outfit:', error);
      alert('Error regenerating outfit. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedWorkStyle = workStyles.find(style => style.value === workStyle);

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Weekly Work Outfit Planner</h3>
            <p className="text-gray-600">Plan your entire work week with AI-curated outfits</p>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              Select Your Work Environment
            </label>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {workStyles.map(style => (
                <button
                  key={style.value}
                  onClick={() => setWorkStyle(style.value)}
                  className={`group relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 ${
                    workStyle === style.value
                      ? 'border-transparent shadow-xl'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-lg'
                  }`}
                >
                  {workStyle === style.value && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${style.color} opacity-10`}></div>
                  )}
                  <div className="relative text-center">
                    <div className={`text-3xl mb-3 ${workStyle === style.value ? 'transform scale-110' : ''} transition-transform duration-300`}>
                      {style.emoji}
                    </div>
                    <h4 className={`font-bold mb-2 ${
                      workStyle === style.value ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {style.label}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {style.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-1 flex lg:flex-col justify-center lg:justify-end">
            <button
              onClick={generateWeeklyOutfits}
              disabled={isGenerating}
              className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full justify-center"
            >
              <Calendar className="h-6 w-6" />
              <span className="text-lg">{isGenerating ? 'Planning...' : 'Plan My Week'}</span>
              {isGenerating && (
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl animate-pulse"></div>
              )}
            </button>
          </div>
        </div>

        {/* Selected Style Summary */}
        {selectedWorkStyle && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className={`p-3 bg-gradient-to-br ${selectedWorkStyle.color} rounded-xl`}>
                <span className="text-2xl">{selectedWorkStyle.emoji}</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">{selectedWorkStyle.label}</h4>
                <p className="text-gray-600">{selectedWorkStyle.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Plan Display */}
      {Object.keys(weeklyPlan).length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Your Work Week Outfits
            </h3>
            <p className="text-gray-600 text-lg">
              {selectedWorkStyle?.label} outfits curated just for you
            </p>
          </div>
          
          <div className="grid gap-8">
            {weekdays.map(day => {
              const outfit = weeklyPlan[day.key];
              return (
                <div key={day.key} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                  <div className={`bg-gradient-to-r ${day.color} p-6`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl">{day.emoji}</div>
                        <div>
                          <h4 className="text-2xl font-bold text-white">{day.label}</h4>
                          <p className="text-white/80">
                            {day.key === 'monday' && 'Start strong'}
                            {day.key === 'tuesday' && 'Keep the momentum'}
                            {day.key === 'wednesday' && 'Midweek power'}
                            {day.key === 'thursday' && 'Almost there'}
                            {day.key === 'friday' && 'Finish in style'}
                          </p>
                        </div>
                      </div>
                      
                      {outfit && (
                        <button
                          onClick={() => regenerateDay(day.key)}
                          disabled={isGenerating}
                          className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50 backdrop-blur-sm"
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span className="text-sm font-medium">Regenerate</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-8">
                    {outfit ? (
                      <OutfitCard 
                        suggestion={outfit} 
                        wardrobeItems={wardrobeItems}
                      />
                    ) : (
                      <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                        <div className="max-w-sm mx-auto">
                          <div className="p-4 bg-gray-200 rounded-2xl inline-block mb-6">
                            <Sparkles className="h-12 w-12 text-gray-400" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-600 mb-2">No outfit planned yet</h4>
                          <p className="text-gray-500">
                            Generate your weekly plan to see a curated outfit for {day.label}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {wardrobeItems.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border-2 border-dashed border-gray-300">
          <div className="max-w-md mx-auto">
            <div className="p-4 bg-gray-200 rounded-2xl inline-block mb-6">
              <Calendar className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-3">No Wardrobe Items</h3>
            <p className="text-gray-500 leading-relaxed text-lg">
              Add some clothing items to your wardrobe to start planning your perfect work week!
            </p>
            <div className="mt-6 flex justify-center">
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Coffee className="h-4 w-4" />
                  <span>Monday ready</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span>Week planned</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Briefcase className="h-4 w-4" />
                  <span>Confidence boosted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyOutfitPlanner;