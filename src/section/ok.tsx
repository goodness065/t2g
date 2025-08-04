/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from 'react';
import { Camera, Shirt, Palette, User, ShoppingBag, Sparkles } from 'lucide-react';
import ImageUpload from '../components/Camera/ImageUpload';
// import WardrobeGrid from '../components/Wardrobe/WardrobeGrid';
// import OutfitGenerator from '../components/Outfits/OutfitGenerator';
import { WardrobeItem, StyleProfile } from '../types/wardrobe';
import { geminiService } from '../services/geminiApi';
import OutfitGenerator from '@/components/Outfits/OutfitGenerator';
import WardrobeGrid from '@/components/Wardrobe/WardrobeGrid';
import { compressBase64Image, safeSetItem, safeGetItem, clearOldData, getStorageInfo } from '../utils/storage';

type ActiveTab = 'wardrobe' | 'outfits' | 'analysis' | 'shopping';
type UploadMode = 'wardrobe' | 'bodytype' | 'color' | null;

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('wardrobe');
  const [uploadMode, setUploadMode] = useState<UploadMode>(null);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedItems = safeGetItem('wardrobeItems');
    const savedProfile = safeGetItem('styleProfile');
    
    if (savedItems) {
      try {
        const items = JSON.parse(savedItems);
        // Convert date strings back to Date objects
        const itemsWithDates = items.map((item: any) => ({
          ...item,
          dateAdded: new Date(item.dateAdded),
          lastWorn: item.lastWorn ? new Date(item.lastWorn) : undefined
        }));
        setWardrobeItems(itemsWithDates);
      } catch (error) {
        console.error('Error loading wardrobe items:', error);
      }
    }
    
    if (savedProfile) {
      try {
        setStyleProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Error loading style profile:', error);
      }
    }
  }, []);

  // Save to localStorage when data changes with compression
  useEffect(() => {
    if (wardrobeItems.length > 0) {
      const success = safeSetItem('wardrobeItems', JSON.stringify(wardrobeItems));
      if (!success) {
        clearOldData(); // Try to clear old data
        const retrySuccess = safeSetItem('wardrobeItems', JSON.stringify(wardrobeItems));
        if (!retrySuccess) {
          alert('Storage limit reached. Consider removing some items or the app will not save new changes.');
        }
      }
    }
  }, [wardrobeItems]);

  useEffect(() => {
    if (styleProfile) {
      const success = safeSetItem('styleProfile', JSON.stringify(styleProfile));
      if (!success) {
        console.warn('Could not save style profile due to storage limitations');
      }
    }
  }, [styleProfile]);

  const handleImageUpload = async (imageSrc: string) => {
    setIsLoading(true);
    const currentUploadMode = uploadMode;
    setUploadMode(null);

    try {
      // Compress the image before processing
      const compressedImage = await compressBase64Image(imageSrc, 600, 0.7);
      
      if (currentUploadMode === 'wardrobe') {
        // Analyze clothing item using original for better analysis
        const analysis = await geminiService.analyzeClothingItem(imageSrc);
        
        const newItem: WardrobeItem = {
          id: `item_${Date.now()}`,
          name: analysis.name || 'New Item',
          category: analysis.category || 'tops',
          subcategory: analysis.subcategory || '',
          colors: analysis.colors || [],
          dominantColor: analysis.dominantColor || 'unknown',
          image: compressedImage, // Store compressed version
          tags: analysis.tags || [],
          season: analysis.season || [],
          occasion: analysis.occasion || [],
          style: analysis.style || [],
          fit: analysis.fit || 'regular',
          material: analysis.material || 'unknown',
          dateAdded: new Date(),
          timesWorn: 0,
          isFavorite: false,
          ...analysis
        };

        setWardrobeItems(prev => [...prev, newItem]);
        alert('Item added to your wardrobe!');
      } else if (currentUploadMode === 'bodytype') {
        // Analyze body type
        const bodyType = await geminiService.analyzeBodyType(imageSrc);
        setStyleProfile(prev => ({
          ...prev,
          bodyType,
          sizeInfo: prev?.sizeInfo || { tops: '', bottoms: '', shoes: '', dresses: '' },
          preferences: prev?.preferences || { comfortLevel: 5, trendiness: 5, colorfulness: 5, formality: 5 },
          preferredStyles: prev?.preferredStyles || [],
          colorProfile: prev?.colorProfile || { season: 'spring', undertone: 'neutral', bestColors: [], avoidColors: [] }
        }));
        alert(`Body type analyzed: ${bodyType}`);
      } else if (currentUploadMode === 'color') {
        // Analyze color profile
        const colorProfile = await geminiService.analyzeColorProfile(imageSrc);
        setStyleProfile(prev => ({
          ...prev,
          colorProfile,
          bodyType: prev?.bodyType || 'rectangle',
          sizeInfo: prev?.sizeInfo || { tops: '', bottoms: '', shoes: '', dresses: '' },
          preferences: prev?.preferences || { comfortLevel: 5, trendiness: 5, colorfulness: 5, formality: 5 },
          preferredStyles: prev?.preferredStyles || []
        }));
        alert(`Color profile analyzed: ${colorProfile.season} with ${colorProfile.undertone} undertones`);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error analyzing image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'wardrobe':
        const storageInfo = getStorageInfo();
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Wardrobe</h2>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  <span>{wardrobeItems.length} items</span>
                  <span className="mx-2">•</span>
                  <span className={`${storageInfo.percentage > 80 ? 'text-red-500' : 'text-gray-500'}`}>
                    Storage: {storageInfo.percentage.toFixed(1)}%
                  </span>
                </div>
                <button
                  onClick={() => setUploadMode('wardrobe')}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Camera className="h-4 w-4" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>
            {storageInfo.percentage > 90 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  ⚠️ Storage almost full ({storageInfo.percentage.toFixed(1)}%). Consider removing some items to save new ones.
                </p>
              </div>
            )}
            <WardrobeGrid 
              items={wardrobeItems} 
              onItemUpdate={(updatedItem) => {
                setWardrobeItems(prev => 
                  prev.map(item => item.id === updatedItem.id ? updatedItem : item)
                );
              }}
            />
          </div>
        );

      case 'outfits':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Outfit Generator</h2>
            <OutfitGenerator 
              wardrobeItems={wardrobeItems}
              styleProfile={styleProfile}
            />
          </div>
        );

      case 'analysis':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Style Analysis</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Body Type Analysis</h3>
                {styleProfile?.bodyType ? (
                  <div className="space-y-2">
                    <p className="text-gray-600">Your body type: <span className="font-medium capitalize">{styleProfile.bodyType}</span></p>
                    <button
                      onClick={() => setUploadMode('bodytype')}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Re-analyze
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setUploadMode('bodytype')}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Analyze Body Type</span>
                  </button>
                )}
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Color Analysis</h3>
                {styleProfile?.colorProfile ? (
                  <div className="space-y-2">
                    <p className="text-gray-600">Season: <span className="font-medium capitalize">{styleProfile.colorProfile.season}</span></p>
                    <p className="text-gray-600">Undertone: <span className="font-medium capitalize">{styleProfile.colorProfile.undertone}</span></p>
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Best colors:</p>
                      <div className="flex flex-wrap gap-1">
                        {styleProfile.colorProfile.bestColors.slice(0, 6).map((color, index) => (
                          <span
                            key={index}
                            className="w-6 h-6 rounded-full border border-gray-300"
                            style={{ backgroundColor: color.toLowerCase() }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadMode('color')}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Re-analyze
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setUploadMode('color')}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Analyze Colors</span>
                  </button>
                )}
              </div>
            </div>

            {/* Style Profile Summary */}
            {styleProfile && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Your Style Profile</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700">Body Type</h4>
                    <p className="capitalize">{styleProfile.bodyType}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Color Season</h4>
                    <p className="capitalize">{styleProfile.colorProfile?.season || 'Not analyzed'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Undertone</h4>
                    <p className="capitalize">{styleProfile.colorProfile?.undertone || 'Not analyzed'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'shopping':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Shopping Assistant</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600">Shopping recommendations coming soon! This feature will help you find similar items to pieces you love and identify gaps in your wardrobe.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const tabs = [
    { id: 'wardrobe', label: 'Wardrobe', icon: Shirt },
    { id: 'outfits', label: 'Outfits', icon: Sparkles },
    { id: 'analysis', label: 'Analysis', icon: User },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Palette className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Style Assistant</h1>
            </div>
            {isLoading && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Analyzing...</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>

      {/* Image Upload Modal */}
      {uploadMode && (
        <ImageUpload
          mode={uploadMode}
          onUpload={handleImageUpload}
          onCancel={() => setUploadMode(null)}
        />
      )}
    </div>
  );
}