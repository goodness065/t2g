"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ImageIcon, Sparkles, Palette, Zap } from 'lucide-react';
import ImageGenerator from '@/section/image-generation';

export default function ImagePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-cyan-100/60 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/70 backdrop-blur-xl shadow-lg border-b border-white/30">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <Link href="/" className="group flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors">
                <div className="p-2 bg-gray-100 group-hover:bg-blue-100 rounded-xl transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </div>
                <span className="font-medium">Back</span>
              </Link>
              
              <div className="h-8 w-px bg-gray-300"></div>
              
              <div className="flex items-center space-x-4">
                <div className="relative p-3 bg-gradient-to-br from-blue-600 via-cyan-600 to-indigo-600 rounded-2xl shadow-lg">
                  <ImageIcon className="h-8 w-8 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-indigo-600 rounded-2xl blur opacity-50 -z-10"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent">
                    Image Generation
                  </h1>
                  <p className="text-gray-600 text-sm font-medium">AI-powered creative image synthesis</p>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
              <Palette className="h-4 w-4 text-blue-600" />
              <span className="text-blue-700 text-sm font-medium">Imagen 4.0 Powered</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50 px-6 py-3 rounded-full mb-8">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Advanced AI Art Generation</span>
              <Zap className="h-4 w-4 text-cyan-600" />
            </div>
            
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              Transform Ideas into
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent block mt-2">
                Stunning Visuals
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto font-light leading-relaxed">
              Create <span className="font-semibold text-blue-600">breathtaking images</span> from simple text descriptions using 
              <span className="font-semibold text-cyan-600"> Google&apos;s Imagen 4.0</span> - the most advanced AI image generator
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-md border border-white/50">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-medium">High Resolution</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-md border border-white/50">
                <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-medium">Any Art Style</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-md border border-white/50">
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-medium">Fast Generation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="relative">
        <ImageGenerator />
      </main>
    </div>
  );
}