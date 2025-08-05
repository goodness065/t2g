"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Brain, FileText } from 'lucide-react';
import Docs from '@/section/docs';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300 mx-4"></div>
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-purple-600" />
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Universal AI Assistant</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <Docs />
    </div>
  );
}