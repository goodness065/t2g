import React, { useState } from 'react';
import { WardrobeItem } from '../../types/wardrobe';
import ItemCard from './ItemCard';
import { Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react';

interface WardrobeGridProps {
  items: WardrobeItem[];
  onItemUpdate: (item: WardrobeItem) => void;
  onItemDelete?: (itemId: string) => void;
}

const WardrobeGrid: React.FC<WardrobeGridProps> = ({ items, onItemUpdate, onItemDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterOccasion, setFilterOccasion] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = [
    { value: 'all', label: 'All Categories', emoji: '👔' },
    { value: 'tops', label: 'Tops', emoji: '👕' },
    { value: 'bottoms', label: 'Bottoms', emoji: '👖' },
    { value: 'dresses', label: 'Dresses', emoji: '👗' },
    { value: 'outerwear', label: 'Outerwear', emoji: '🧥' },
    { value: 'shoes', label: 'Shoes', emoji: '👟' },
    { value: 'accessories', label: 'Accessories', emoji: '👜' }
  ];

  const occasions = [
    { value: 'all', label: 'All Occasions' },
    { value: 'casual', label: 'Casual' },
    { value: 'work', label: 'Work' },
    { value: 'formal', label: 'Formal' },
    { value: 'party', label: 'Party' },
    { value: 'athletic', label: 'Athletic' }
  ];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesOccasion = filterOccasion === 'all' || item.occasion.includes(filterOccasion as WardrobeItem['occasion'][0]);

    return matchesSearch && matchesCategory && matchesOccasion;
  });

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
            <SlidersHorizontal className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Search & Filter</h3>
            <p className="text-gray-600 text-sm">Find the perfect items in your wardrobe</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Search Items</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your wardrobe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-900"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.emoji} {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Occasion Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Occasion</label>
            <select
              value={filterOccasion}
              onChange={(e) => setFilterOccasion(e.target.value)}
              className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-900"
            >
              {occasions.map(occasion => (
                <option key={occasion.value} value={occasion.value}>
                  {occasion.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Summary and View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span className="font-medium">
                {filteredItems.length} of {items.length} items
              </span>
            </div>
            {(searchTerm || filterCategory !== 'all' || filterOccasion !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('all');
                  setFilterOccasion('all');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Grid className="h-4 w-4" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <List className="h-4 w-4" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Items Grid/List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border-2 border-dashed border-gray-300">
          <div className="max-w-md mx-auto">
            <div className="p-4 bg-gray-200 rounded-2xl inline-block mb-6">
              <Search className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-3">
              {items.length === 0 ? 'No items in your wardrobe yet' : 'No items match your search'}
            </h3>
            <p className="text-gray-500 leading-relaxed">
              {items.length === 0 
                ? 'Start by adding some clothing items to build your digital wardrobe!' 
                : 'Try adjusting your search terms or filters to find what you\'re looking for'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
            : 'space-y-4'
        }>
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onUpdate={onItemUpdate}
              onDelete={onItemDelete}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WardrobeGrid; 