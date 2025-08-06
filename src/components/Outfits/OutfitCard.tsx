/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { OutfitSuggestion, WardrobeItem } from '../../types/wardrobe';
import { Star, AlertCircle, Sparkles, Heart } from 'lucide-react';

interface OutfitCardProps {
  suggestion: OutfitSuggestion;
  wardrobeItems: WardrobeItem[];
}

const OutfitCard: React.FC<OutfitCardProps> = ({ suggestion, wardrobeItems }) => {
  console.log('suggestion:', suggestion);
  
  // Handle both array and object formats for items
  let itemIds: string[] = [];
  if (Array.isArray(suggestion.outfit.items)) {
    itemIds = suggestion.outfit.items;
  } else if (typeof suggestion.outfit.items === 'object' && suggestion.outfit.items !== null) {
    // If items is an object like {top: "item_id", bottoms: "item_id"}, extract the values
    itemIds = Object.values(suggestion.outfit.items).filter(id => typeof id === 'string');
  }
  
  const outfitItems = itemIds
    .map(itemId => wardrobeItems.find(item => item.id === itemId))
    .filter(Boolean) as WardrobeItem[];

  const confidenceColor = suggestion.confidence >= 0.8 ? 'from-green-500 to-emerald-600' :
    suggestion.confidence >= 0.6 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-pink-600';

  const confidenceTextColor = suggestion.confidence >= 0.8 ? 'text-green-700' :
    suggestion.confidence >= 0.6 ? 'text-yellow-700' : 'text-red-700';

  const processMissingItems = (missingItems: string[]) => {
    return missingItems.map(item => {
      // Use regex to find item IDs within the text and replace them
      return item.replace(/item_\d+/g, (itemId) => {
        const foundItem = wardrobeItems.find(wardrobeItem => wardrobeItem.id === itemId);
        return foundItem ? foundItem.name : 'A wardrobe item (not found)';
      });
    });
  };

  return (
    <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/50">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                {suggestion.outfit.name}
              </h4>
              <p className="text-gray-600 text-sm">AI-curated outfit</p>
            </div>
          </div>
          
          <div className={`flex items-center space-x-2 px-3 py-2 bg-gradient-to-r ${confidenceColor} rounded-full shadow-lg`}>
            <Star className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">
              {Math.round(suggestion.confidence * 100)}%
            </span>
          </div>
        </div>

        {/* Outfit Items */}
        <div className="mb-6">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Outfit pieces:</h5>
          <div className="grid grid-cols-3 gap-3">
            {outfitItems.map(item => (
              <div key={item.id} className="group/item text-center">
                <div className="relative overflow-hidden rounded-2xl shadow-md group-hover/item:shadow-lg transition-shadow duration-300">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full aspect-square object-cover group-hover/item:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                </div>
                <p className="text-xs text-gray-600 mt-2 font-medium truncate" title={item.name}>
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Reasoning */}
        <div className="mb-6">
          <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
            <Heart className="h-4 w-4 text-pink-500" />
            <span>Why this works:</span>
          </h5>
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed">{suggestion.reasoning}</p>
          </div>
        </div>

        {/* Body Type Notes */}
        {suggestion.bodyTypeNotes && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <Star className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-purple-800 mb-2">Body Type Benefits:</h5>
                  <p className="text-sm text-purple-700 leading-relaxed">{suggestion.bodyTypeNotes}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Missing Items */}
        {suggestion.missingItems && suggestion.missingItems.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <div className="p-1.5 bg-orange-100 rounded-lg flex-shrink-0">
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h6 className="text-sm font-semibold text-orange-800 mb-2">Could be enhanced with:</h6>
                <ul className="text-sm text-orange-700 space-y-1">
                  {processMissingItems(suggestion.missingItems).map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Confidence Badge */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">AI Confidence Score</span>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${confidenceTextColor} bg-white shadow-sm`}>
              {suggestion.confidence >= 0.8 ? 'Excellent Match' :
               suggestion.confidence >= 0.6 ? 'Good Match' : 'Fair Match'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutfitCard;