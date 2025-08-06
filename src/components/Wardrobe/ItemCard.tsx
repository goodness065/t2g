/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { WardrobeItem } from '../../types/wardrobe';
import { Heart, Eye, Plus, Star, Calendar, Palette, Tag } from 'lucide-react';

interface ItemCardProps {
  item: WardrobeItem;
  onUpdate: (item: WardrobeItem) => void;
  onDelete?: (itemId: string) => void;
  viewMode?: 'grid' | 'list';
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onUpdate, onDelete, viewMode = 'grid' }) => {
  const [showDetails, setShowDetails] = useState(false);

  const incrementWorn = () => {
    onUpdate({
      ...item,
      timesWorn: item.timesWorn + 1,
      lastWorn: new Date()
    });
  };

  if (viewMode === 'list') {
    return (
      <>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 overflow-hidden">
          <div className="flex">
            <div className="w-24 h-24 flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 capitalize mb-2">{item.category} • {item.subcategory}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Worn {item.timesWorn}x</span>
                    </span>
                    <span>•</span>
                    <span>{item.colors.length} colors</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowDetails(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={incrementWorn}
                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium"
                  >
                    Wore it
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Modal - same as grid version */}
        {showDetails && <DetailsModal item={item} onClose={() => setShowDetails(false)} />}
      </>
    );
  }

  return (
    <>
      <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/50">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex justify-between items-end">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowDetails(true)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-colors shadow-lg"
                  >
                    <Eye className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
                <button
                  onClick={incrementWorn}
                  className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium text-sm shadow-lg transform hover:scale-105"
                >
                  <Plus className="h-3 w-3" />
                  <span>Wore it</span>
                </button>
              </div>
            </div>
          </div>

          {/* Favorite indicator */}
          {item.isFavorite && (
            <div className="absolute top-3 right-3 p-1.5 bg-red-500 rounded-full shadow-lg">
              <Heart className="h-3 w-3 text-white" fill="currentColor" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-1 truncate group-hover:text-gray-800 transition-colors">
            {item.name}
          </h3>
          <p className="text-xs text-gray-600 capitalize mb-3">{item.category}</p>

          {/* Colors */}
          <div className="flex items-center space-x-2 mb-3">
            <Palette className="h-3 w-3 text-gray-400" />
            <div className="flex space-x-1">
              {item.colors.slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: color.replace(/\s+/g, '').toLowerCase() }}
                  title={color}
                />
              ))}
              {item.colors.length > 3 && (
                <div className="w-4 h-4 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center">
                  <span className="text-xs text-gray-600 font-medium">+{item.colors.length - 3}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span className="font-medium">Worn {item.timesWorn}x</span>
            </div>
            
            {item.timesWorn > 5 && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full">
                <Star className="h-3 w-3 text-yellow-600" />
                <span className="text-xs font-medium text-yellow-700">Favorite</span>
              </div>
            )}
          </div>

          {/* Tags Preview */}
          {item.tags.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <Tag className="h-3 w-3 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 2 && (
                    <span className="text-xs text-gray-400">+{item.tags.length - 2}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && <DetailsModal item={item} onClose={() => setShowDetails(false)} />}
    </>
  );
};

// Extracted Details Modal Component
const DetailsModal: React.FC<{ item: WardrobeItem; onClose: () => void }> = ({ item, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{item.name}</h2>
                <p className="text-gray-600 capitalize">{item.category} • {item.subcategory}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="text-2xl text-gray-400 hover:text-gray-600">×</span>
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image */}
            <div className="space-y-4">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-xl">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Basic Details */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-gray-600" />
                  <span>Item Details</span>
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Category:</span>
                    <p className="capitalize">{item?.category}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Subcategory:</span>
                    <p className="capitalize">{item?.subcategory}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Material:</span>
                    <p className="capitalize">{item?.material}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Fit:</span>
                    <p className="capitalize">{item?.fit}</p>
                  </div>
                  {item.brand && (
                    <div className="col-span-2">
                      <span className="font-semibold text-gray-700">Brand:</span>
                      <p>{item?.brand}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Colors */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Palette className="h-5 w-5 text-blue-600" />
                  <span>Colors</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {item?.colors?.map((color, index) => (
                    <div key={index} className="flex items-center space-x-3 bg-white/80 rounded-xl p-3">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: color.replace(/\s+/g, '').toLowerCase() }}
                      />
                      <span className="font-medium text-gray-700 capitalize">{color}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Style & Occasions */}
              <div className="space-y-4">
                {/* Style */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Style Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {item?.style?.map((style, index) => (
                      <span key={index} className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-xl text-sm font-medium border border-purple-200">
                        {style}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Occasions */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Occasions</h4>
                  <div className="flex flex-wrap gap-2">
                    {item?.occasion?.map((occasion, index) => (
                      <span key={index} className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-xl text-sm font-medium border border-green-200">
                        {occasion}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Seasons */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Seasons</h4>
                  <div className="flex flex-wrap gap-2">
                    {item?.season?.map((season, index) => (
                      <span key={index} className="px-3 py-1.5 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 rounded-xl text-sm font-medium border border-orange-200">
                        {season}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  <span>Usage Statistics</span>
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Times worn:</span>
                    <span className="text-emerald-700 font-bold">{item?.timesWorn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Added to wardrobe:</span>
                    <span className="text-gray-600">{item?.dateAdded?.toLocaleDateString()}</span>
                  </div>
                  {item?.lastWorn && (
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Last worn:</span>
                      <span className="text-gray-600">{item?.lastWorn?.toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {item?.tags?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Additional Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {item?.tags?.map((tag, index) => (
                      <span key={index} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium border border-gray-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard; 