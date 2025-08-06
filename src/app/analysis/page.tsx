/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Camera, 
  Shirt, 
  Palette, 
  User, 
  Sparkles, 
  ArrowLeft,
  Brain,
  Zap,
  Star
} from 'lucide-react';
import ImageUpload from '../../components/Camera/ImageUpload';
import { WardrobeItem, StyleProfile, OutfitSuggestion } from '../../types/wardrobe';
import { geminiService } from '../../services/geminiApi';
import OutfitGenerator from '@/components/Outfits/OutfitGenerator';
import WardrobeGrid from '@/components/Wardrobe/WardrobeGrid';
import OutfitCard from '@/components/Outfits/OutfitCard';
import { compressBase64Image, safeSetItem, safeGetItem, clearOldData, getStorageInfo } from '../../utils/storage';

type ActiveTab = 'wardrobe' | 'outfits' | 'analysis' | 'shopping';
type UploadMode = 'wardrobe' | 'bodytype' | 'color' | null;

export default function WardrobePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('wardrobe');
  const [uploadMode, setUploadMode] = useState<UploadMode>(null);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bodyTypeOutfits, setBodyTypeOutfits] = useState<OutfitSuggestion[]>([]);
  const [isGeneratingBodyType, setIsGeneratingBodyType] = useState(false);

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
          colorProfile: prev?.colorProfile || undefined
        }));
        alert(`Body type analyzed: ${bodyType}`);
      } else if (currentUploadMode === 'color') {
        // Analyze color profile
        const colorProfile = await geminiService.analyzeColorProfile(imageSrc);
        setStyleProfile(prev => ({
          ...prev,
          colorProfile,
          bodyType: prev?.bodyType || undefined,
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

  const generateBodyTypeOutfits = async () => {
    if (!styleProfile?.bodyType) {
      alert('Please analyze your body type first!');
      return;
    }

    if (wardrobeItems.length === 0) {
      alert('Please add some items to your wardrobe first!');
      return;
    }

    setIsGeneratingBodyType(true);
    try {
      const outfitSuggestions = await geminiService.generateBodyTypeOutfits(
        wardrobeItems,
        styleProfile.bodyType,
        styleProfile
      );
      setBodyTypeOutfits(outfitSuggestions);
    } catch (error) {
      console.error('Error generating body type outfits:', error);
      alert('Error generating body type outfits. Please try again.');
    } finally {
      setIsGeneratingBodyType(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'wardrobe':
        const storageInfo = getStorageInfo();
        return (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  My Wardrobe
                </h2>
                <p className="text-gray-600 mt-1">Manage and organize your clothing collection</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50 shadow-sm">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Shirt className="h-4 w-4" />
                    <span className="font-medium">{wardrobeItems.length} items</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${storageInfo.percentage > 80 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <span className={`font-medium ${storageInfo.percentage > 80 ? 'text-red-600' : 'text-gray-600'}`}>
                      {storageInfo.percentage.toFixed(1)}% storage
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setUploadMode('wardrobe')}
                  disabled={isLoading}
                  className="group relative inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Camera className="h-5 w-5" />
                  {
                    isLoading ?  
                        <span>
                          Adding...
                        </span>

                    : (
                      <span>Add Item</span>
                    )
                  }
                 
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-50 -z-10 group-hover:opacity-70 transition-opacity"></div>
                </button>
              </div>
            </div>
            
            {storageInfo.percentage > 90 && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-red-100 p-2 rounded-xl">
                    <Zap className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800 mb-1">Storage Almost Full</h4>
                    <p className="text-red-700 text-sm">
                      You&apos;re using {storageInfo.percentage.toFixed(1)}% of your storage. Consider removing some items to save new ones.
                    </p>
                  </div>
                </div>
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
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Outfit Generator
              </h2>
              <p className="text-gray-600 mt-1">Create perfect outfits from your wardrobe</p>
            </div>
            <OutfitGenerator 
              wardrobeItems={wardrobeItems}
              styleProfile={styleProfile}
            />
          </div>
        );

      case 'analysis':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Style Analysis
              </h2>
              <p className="text-gray-600 mt-1">Discover your personal style with AI-powered analysis</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Body Type Analysis Card */}
              <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Body Type Analysis</h3>
                      <p className="text-gray-600 text-sm">Understand your unique body shape</p>
                    </div>
                  </div>
                  
                  {styleProfile?.bodyType ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                        <div className="flex items-center space-x-2 mb-2">
                          <Star className="h-5 w-5 text-purple-600" />
                          <span className="font-semibold text-purple-800">Your Body Type</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-900 capitalize">{styleProfile.bodyType}</p>
                      </div>
                      <button
                        onClick={() => setUploadMode('bodytype')}
                        disabled={isLoading || isGeneratingBodyType}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm hover:underline transition-colors"
                      >
                        {
                          isLoading || isGeneratingBodyType ? 
                            <span>
                              Analyzing...
                            </span>
                          :
                            <span>
                              Re-analyze body type
                            </span>
                        }
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-600">Upload a full-body photo to discover your body type and get personalized style recommendations.</p>
                      <button
                        onClick={() => setUploadMode('bodytype')}
                        disabled={isLoading || isGeneratingBodyType}
                        className="group relative inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <Camera className="h-5 w-5" />
                        {
                          isLoading || isGeneratingBodyType ? 
                            <span>
                              Analyzing...
                            </span>
                          :
                            <span>Analyze Body Type</span>
                        }
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Color Analysis Card */}
              <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl shadow-lg">
                      <Palette className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Color Analysis</h3>
                      <p className="text-gray-600 text-sm">Find your perfect color palette</p>
                    </div>
                  </div>
                  
                  {styleProfile?.colorProfile ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-6 border border-blue-100">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <Star className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-blue-800 text-sm">Season</span>
                            </div>
                            <p className="font-bold text-blue-900 capitalize">{styleProfile.colorProfile.season}</p>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <Star className="h-4 w-4 text-teal-600" />
                              <span className="font-medium text-teal-800 text-sm">Undertone</span>
                            </div>
                            <p className="font-bold text-teal-900 capitalize">{styleProfile.colorProfile.undertone}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setUploadMode('color')}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline transition-colors"
                      >
                        Re-analyze color profile
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-600">Upload a clear photo of your face in natural lighting to discover your color season and undertones.</p>
                      <button
                        onClick={() => setUploadMode('color')}
                        className="group relative inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <Camera className="h-5 w-5" />
                        <span>Analyze Colors</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Style Profile Summary */}
            {styleProfile && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl shadow-lg">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Your Style Profile</h3>
                    <p className="text-gray-600">Complete analysis overview</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2">Body Type</h4>
                    <p className="text-lg font-bold text-purple-900 capitalize">{styleProfile.bodyType}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Color Season</h4>
                    <p className="text-lg font-bold text-blue-900 capitalize">{styleProfile.colorProfile?.season || 'Not analyzed'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 border border-teal-200">
                    <h4 className="font-semibold text-teal-800 mb-2">Undertone</h4>
                    <p className="text-lg font-bold text-teal-900 capitalize">{styleProfile.colorProfile?.undertone || 'Not analyzed'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Body Type Outfit Recommendations */}
            {styleProfile?.bodyType && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-rose-600 to-pink-600 rounded-2xl shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Body Type Recommendations</h3>
                    <p className="text-gray-600">Outfits tailored for your <span className="font-medium capitalize text-rose-600">{styleProfile.bodyType}</span> body type</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-8">
                  <button
                    onClick={generateBodyTypeOutfits}
                    disabled={isGeneratingBodyType}
                    className="group relative inline-flex items-center space-x-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <User className="h-5 w-5" />
                    <span>{isGeneratingBodyType ? 'Generating...' : 'Get Personalized Recommendations'}</span>
                    {isGeneratingBodyType && (
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl animate-pulse"></div>
                    )}
                  </button>
                  
                  {bodyTypeOutfits.length > 0 && (
                    <button
                      onClick={() => setBodyTypeOutfits([])}
                      className="text-gray-500 hover:text-gray-700 font-medium text-sm hover:underline transition-colors"
                    >
                      Clear Results
                    </button>
                  )}
                </div>

                {bodyTypeOutfits.length > 0 && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100">
                      <h4 className="font-semibold text-rose-800 mb-2">Recommended Outfits for {styleProfile.bodyType} Body Type</h4>
                      <p className="text-rose-700 text-sm">These combinations are specifically chosen to enhance your natural silhouette</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      {bodyTypeOutfits.map((suggestion, index) => (
                        <OutfitCard
                          key={index}
                          suggestion={suggestion}
                          wardrobeItems={wardrobeItems}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const tabs = [
    { id: 'wardrobe', label: 'Wardrobe', icon: Shirt, gradient: 'from-indigo-600 to-purple-600' },
    { id: 'outfits', label: 'Outfits', icon: Sparkles, gradient: 'from-pink-600 to-purple-600' },
    { id: 'analysis', label: 'Analysis', icon: User, gradient: 'from-blue-600 to-teal-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/60 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-pink-400/20 to-rose-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-teal-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/70 backdrop-blur-xl shadow-lg border-b border-white/30">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <Link href="/" className="group flex items-center space-x-3 text-gray-600 hover:text-indigo-600 transition-colors">
                <div className="p-2 bg-gray-100 group-hover:bg-indigo-100 rounded-xl transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </div>
                <span className="font-medium">Back</span>
              </Link>
              
              <div className="h-8 w-px bg-gray-300"></div>
              
              <div className="flex items-center space-x-4">
                <div className="relative p-3 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-lg">
                  <Palette className="h-8 w-8 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-50 -z-10"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Style Assistant
                  </h1>
                  <p className="text-gray-600 text-sm font-medium">AI-powered wardrobe & style analysis</p>
                </div>
              </div>
            </div>
            
            {(isLoading || isGeneratingBodyType) && (
              <div className="flex items-center space-x-3 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-200">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                <span className="text-indigo-700 text-sm font-medium">
                  {isLoading ? 'Analyzing...' : 'Generating recommendations...'}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="relative bg-white/50 backdrop-blur-sm border-b mt-14 border-white/30">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`relative flex items-center space-x-3 py-4 px-6 font-semibold text-sm transition-all duration-300 ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-t-2xl shadow-lg`}></div>
                  )}
                  <div className="relative flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </div>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white/50 to-white/30 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
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