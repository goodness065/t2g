"use client";
import React from 'react';
import Link from 'next/link';
import { 
  Shirt, 
  Mic, 
  Image as ImageIcon, 
  Video, 
  Sparkles,
  Brain,
  ArrowRight 
} from 'lucide-react';

export default function Dashboard() {
  const features = [
    {
      title: "Fast Analyser",
      description: "AI-powered image and text analysis with instant insights",
      icon: Brain,
      href: "/docs",
      color: "bg-purple-500 hover:bg-purple-600",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      title: "Audio Generation", 
      description: "Text-to-speech with multiple voice options and styles",
      icon: Mic,
      href: "/audio",
      color: "bg-green-500 hover:bg-green-600",
      gradient: "from-green-500 to-green-600"
    },
    {
      title: "Image Generation",
      description: "Create stunning images with AI using Imagen 4.0",
      icon: ImageIcon,
      href: "/image", 
      color: "bg-blue-500 hover:bg-blue-600",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "Video Generation",
      description: "Generate high-quality videos from text descriptions",
      icon: Video,
      href: "/video",
      color: "bg-red-500 hover:bg-red-600", 
      gradient: "from-red-500 to-red-600"
    },
    {
      title: "Style Assistant",
      description: "Wardrobe management and outfit recommendations",
      icon: Shirt,
      href: "/analysis",
      color: "bg-indigo-500 hover:bg-indigo-600",
      gradient: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Gemini AI Toolkit
                </h1>
                <p className="text-gray-600 text-sm">Powered by Google&apos;s latest AI models</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Unleash the Power of
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block">
              Artificial Intelligence
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Access cutting-edge AI capabilities including image generation, video creation, 
            audio synthesis, intelligent analysis, and personalized style assistance - all in one place.
          </p>
          <div className="flex justify-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Powered by Gemini 2.5 Flash</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Imagen 4.0 & Veo 3.0</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" 
                       style={{backgroundImage: `linear-gradient(to bottom right, ${feature.gradient.split(' ')[1]}, ${feature.gradient.split(' ')[3]})`}} />
                  
                  <div className="relative p-8">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-4`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-6 line-clamp-2">
                      {feature.description}
                    </p>
                    
                    <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
                      <span>Explore feature</span>
                      <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">5+</div>
              <div className="text-gray-600">AI Tools</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
              <div className="text-gray-600">Possibilities</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">Fast</div>
              <div className="text-gray-600">Processing</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-600 mb-2">AI</div>
              <div className="text-gray-600">Powered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-semibold">Gemini AI Toolkit</span>
          </div>
          <p className="text-gray-400">
            Built with Google&apos;s most advanced AI models
          </p>
        </div>
      </footer>
    </div>
  );
}