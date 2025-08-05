import React, { useState } from 'react';
import { WardrobeItem } from '../../types/wardrobe';
import ItemCard from './ItemCard';
import { Search } from 'lucide-react';

interface WardrobeGridProps {
  items: WardrobeItem[];
  onItemUpdate: (item: WardrobeItem) => void;
  onItemDelete?: (itemId: string) => void;
}

const WardrobeGrid: React.FC<WardrobeGridProps> = ({ items, onItemUpdate, onItemDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterOccasion, setFilterOccasion] = useState<string>('all');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesOccasion = filterOccasion === 'all' || item.occasion.includes(filterOccasion as WardrobeItem['occasion'][0]);

    return matchesSearch && matchesCategory && matchesOccasion;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search your wardrobe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="tops">Tops</option>
            <option value="bottoms">Bottoms</option>
            <option value="dresses">Dresses</option>
            <option value="outerwear">Outerwear</option>
            <option value="shoes">Shoes</option>
            <option value="accessories">Accessories</option>
          </select>

          <select
            value={filterOccasion}
            onChange={(e) => setFilterOccasion(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Occasions</option>
            <option value="casual">Casual</option>
            <option value="work">Work</option>
            <option value="formal">Formal</option>
            <option value="party">Party</option>
            <option value="athletic">Athletic</option>
          </select>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            {items.length === 0 ? 'No items in your wardrobe yet' : 'No items match your search'}
          </p>
          <p className="text-gray-400">
            {items.length === 0 ? 'Start by adding some clothing items!' : 'Try adjusting your search or filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onUpdate={onItemUpdate}
              onDelete={onItemDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WardrobeGrid; 