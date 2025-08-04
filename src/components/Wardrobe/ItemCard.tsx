/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { WardrobeItem } from '../../types/wardrobe';
import { Heart, Eye } from 'lucide-react';

interface ItemCardProps {
  item: WardrobeItem;
  onUpdate: (item: WardrobeItem) => void;
  onDelete?: (itemId: string) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onUpdate, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);
  

  const toggleFavorite = () => {
    onUpdate({
      ...item,
      isFavorite: !item.isFavorite
    });
  };

  const incrementWorn = () => {
    onUpdate({
      ...item,
      timesWorn: item.timesWorn + 1,
      lastWorn: new Date()
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-square">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={toggleFavorite}
            className={`absolute top-2 right-2 p-1 rounded-full ${
              item.isFavorite
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className="h-4 w-4" fill={item.isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="p-3">
          <h3 className="font-medium text-sm mb-1 truncate">{item.name}</h3>
          <p className="text-xs text-gray-500 capitalize mb-2">{item.category}</p>

          <div className="flex flex-wrap gap-1 mb-2">
            {item.colors.slice(0, 3).map((color, index) => (
              <span
                key={index}
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
              />
            ))}
            {item.colors.length > 3 && (
              <span className="text-xs text-gray-400">+{item.colors.length - 3}</span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Worn {item.timesWorn}x</span>
            <div className="flex gap-1">
              <button
                onClick={() => setShowDetails(true)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Eye className="h-3 w-3" />
              </button>
              <button
                onClick={incrementWorn}
                className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
              >
                Wore
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{item.name}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full rounded-lg"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Category:</span> {item.category}</p>
                      <p><span className="font-medium">Subcategory:</span> {item.subcategory}</p>
                      <p><span className="font-medium">Material:</span> {item.material}</p>
                      <p><span className="font-medium">Fit:</span> {item.fit}</p>
                      {item.brand && <p><span className="font-medium">Brand:</span> {item.brand}</p>}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Colors</h3>
                    <div className="flex flex-wrap gap-2">
                      {item.colors.map((color, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-2 text-sm bg-gray-100 px-2 py-1 rounded"
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: color.toLowerCase() }}
                          />
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Style & Occasions</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Style:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.style.map((style, index) => (
                            <span key={index} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                              {style}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Occasions:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.occasion.map((occasion, index) => (
                            <span key={index} className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                              {occasion}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Seasons:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.season.map((season, index) => (
                            <span key={index} className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                              {season}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Usage Stats</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Times worn:</span> {item.timesWorn}</p>
                      <p><span className="font-medium">Added:</span> {item.dateAdded.toLocaleDateString()}</p>
                      {item.lastWorn && (
                        <p><span className="font-medium">Last worn:</span> {item.lastWorn.toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>

                  {item.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
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
      )}
    </>
  );
};

export default ItemCard; 