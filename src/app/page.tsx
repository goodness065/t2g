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
  ArrowRight,
  Star,
  Zap,
  Shield,
} from 'lucide-react';

export default function Dashboard() {
  const features = [
    {
      title: "Fraud Detection",
      description: "Custom trained AI models for fraud detection",
      icon: Shield,
      href: "/fraud",
      color: "bg-purple-500 hover:bg-purple-600",
      gradient: "from-purple-500 to-purple-600"
    },
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
    <div className="min-h-screen space-y-24 lg:space-y-32 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/60 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-pink-400/20 to-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/70 backdrop-blur-xl shadow-lg border-b border-white/30">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="relative p-3 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-lg">
                <Sparkles className="h-10 w-10 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-50 -z-10"></div>
              </div>
              <div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Gemini AI Toolkit
                </h1>
                <p className="text-gray-600 text-sm font-medium">Powered by Google&apos;s latest AI models</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 text-sm font-medium">All Systems Operational</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative ">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 px-6 py-3 rounded-full mb-8">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-700">Next-Generation AI Platform</span>
              <Sparkles className="h-4 w-4 text-purple-500" />
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-extrabold text-gray-900 mb-8 leading-tight">
              Unleash the Power of
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block mt-2">
                Artificial Intelligence
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto font-light leading-relaxed">
              Access cutting-edge AI capabilities including <span className="font-semibold text-blue-600">image generation</span>, 
              <span className="font-semibold text-purple-600"> video creation</span>, 
              <span className="font-semibold text-green-600"> audio synthesis</span>, and 
              <span className="font-semibold text-pink-600"> intelligent analysis</span> - all in one powerful platform.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 mb-12">
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-md border border-white/50">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-medium">Powered by Gemini 2.5 Flash</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-md border border-white/50">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-medium">Imagen 4.0 & Veo 3.0</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative ">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful AI Tools at Your Fingertips
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our comprehensive suite of AI-powered tools designed to enhance your creativity and productivity
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-white/50"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Hover gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  {/* Glowing border effect */}
                  <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${feature.gradient} p-[1px]`}>
                    <div className="w-full h-full bg-white/90 rounded-3xl"></div>
                  </div>
                  
                  <div className="relative p-8">
                    {/* Icon with enhanced styling */}
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <div className="flex items-center text-sm font-semibold text-gray-500 group-hover:text-blue-600 transition-colors">
                      <span>Explore feature</span>
                      <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="relative4 bg-gradient-to-r from-white/90 via-blue-50/90 to-purple-50/90 backdrop-blur-xl">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Creators Worldwide
            </h3>
            <p className="text-xl text-gray-600">
              Join thousands of users leveraging the power of AI
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg group-hover:shadow-xl transition-shadow duration-300 border border-white/50">
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">5+</div>
                <div className="text-gray-600 font-medium text-lg">AI Tools</div>
                <div className="w-12 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mt-4"></div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg group-hover:shadow-xl transition-shadow duration-300 border border-white/50">
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">∞</div>
                <div className="text-gray-600 font-medium text-lg">Possibilities</div>
                <div className="w-12 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto mt-4"></div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg group-hover:shadow-xl transition-shadow duration-300 border border-white/50">
                <div className="flex items-center justify-center mb-3">
                  <Zap className="h-12 w-12 text-green-600" />
                </div>
                <div className="text-gray-600 font-medium text-lg">Lightning Fast</div>
                <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mx-auto mt-4"></div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg group-hover:shadow-xl transition-shadow duration-300 border border-white/50">
                <div className="flex items-center justify-center mb-3">
                  <Shield className="h-12 w-12 text-blue-600" />
                </div>
                <div className="text-gray-600 font-medium text-lg">Secure & Reliable</div>
                <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full mx-auto mt-4"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        
        <div className="relative max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Gemini AI Toolkit
              </span>
            </div>
            
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Built with Google&apos;s most advanced AI models to help you create, analyze, and innovate like never before.
            </p>
            
            <div className="flex justify-center space-x-6 mb-8">
              <div className="flex items-center space-x-2 text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Powered by Gemini</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Enterprise Ready</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm">24/7 Support</span>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-8">
              <p className="text-gray-400 text-sm">
                © 2025 Gemini AI Toolkit. Empowering creativity through artificial intelligence.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}