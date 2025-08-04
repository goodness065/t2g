/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { OutfitSuggestion, WardrobeItem } from '../../types/wardrobe';
import { Star, AlertCircle } from 'lucide-react';

interface OutfitCardProps {
  suggestion: OutfitSuggestion;
  wardrobeItems: WardrobeItem[];
}

const OutfitCard: React.FC<OutfitCardProps> = ({ suggestion, wardrobeItems }) => {
  const outfitItems = suggestion.outfit.items
    .map(itemId => wardrobeItems.find(item => item.id === itemId))
    .filter(Boolean) as WardrobeItem[];

  const confidenceColor = suggestion.confidence >= 0.8 ? 'text-green-600' :
    suggestion.confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-semibold">{suggestion.outfit.name}</h4>
        <div className={`flex items-center space-x-1 ${confidenceColor}`}>
          <Star className="h-4 w-4" />
          <span className="text-sm font-medium">
            {Math.round(suggestion.confidence * 100)}%
          </span>
        </div>
      </div>

      {/* Outfit Items */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {outfitItems.map(item => (
          <div key={item.id} className="text-center">
            <img
              src={item.image}
              alt={item.name}
              className="w-full aspect-square object-cover rounded-lg mb-1"
            />
            <p className="text-xs text-gray-600 truncate">{item.name}</p>
          </div>
        ))}
      </div>

      {/* Reasoning */}
      <div className="mb-4">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Why this works:</h5>
        <p className="text-sm text-gray-600">{suggestion.reasoning}</p>
      </div>

      {/* Missing Items */}
      {suggestion.missingItems && suggestion.missingItems.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <h6 className="text-sm font-medium text-orange-800">Could be improved with:</h6>
              <ul className="text-sm text-orange-700 mt-1 space-y-1">
                {suggestion.missingItems.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutfitCard;