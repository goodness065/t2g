"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Brain, FileText, Sparkles, Zap } from 'lucide-react';
import Docs from '@/section/docs';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/50 to-blue-100/60 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/70 backdrop-blur-xl shadow-lg border-b border-white/30">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <Link href="/" className="group flex items-center space-x-3 text-gray-600 hover:text-purple-600 transition-colors">
                <div className="p-2 bg-gray-100 group-hover:bg-purple-100 rounded-xl transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </div>
                <span className="font-medium">Back</span>
              </Link>
              
              <div className="h-8 w-px bg-gray-300"></div>
              
              <div className="flex items-center space-x-4">
                <div className="relative p-3 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                  <div className="flex items-center space-x-1">
                    <Brain className="h-6 w-6 text-white" />
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-2xl blur opacity-50 -z-10"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Universal AI Assistant
                  </h1>
                  <p className="text-gray-600 text-sm font-medium">Analyze, generate, and understand with AI</p>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-full border border-purple-200">
              <Zap className="h-4 w-4 text-purple-600" />
              <span className="text-purple-700 text-sm font-medium">Multi-Modal AI</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/50 px-6 py-3 rounded-full mb-8">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-semibold text-gray-700">Advanced AI Analysis</span>
              <Sparkles className="h-4 w-4 text-blue-600" />
            </div>
            
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              Your Universal
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent block mt-2">
                AI Assistant
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto font-light leading-relaxed">
              Upload <span className="font-semibold text-purple-600">documents</span>, analyze 
              <span className="font-semibold text-blue-600"> images</span>, ask questions, and get 
              <span className="font-semibold text-indigo-600"> intelligent responses</span> from our advanced AI
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-md border border-white/50">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-medium">PDF Analysis</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-md border border-white/50">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-medium">Image Understanding</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-md border border-white/50">
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-medium">Smart Conversation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="relative">
        <Docs />
      </main>
    </div>
  );
}