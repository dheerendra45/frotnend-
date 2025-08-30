import React, { useState, useEffect } from 'react';
import { Info, Server, Github, ExternalLink, Heart, Zap, Shield } from 'lucide-react';
import { getHealth } from '../api/client';
import { HealthResponse } from '../types/api';
import { Skeleton } from '../components/Skeleton';

export function About() {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      setIsLoading(true);
      setConnectionError(null);
      const health = await getHealth();
      setHealthData(health);
    } catch (err) {
      setConnectionError(err instanceof Error ? err.message : 'Failed to connect to backend');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          About AttackedAI
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Advanced briefing analysis platform with AI-powered insights
        </p>
      </div>

      <div className="space-y-8">
        {/* App Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Info className="mr-2 h-5 w-5" />
              Overview
            </h2>
          </div>
          
          <div className="p-6">
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                AttackedAI is a comprehensive briefing analysis platform that combines optical character recognition (OCR), 
                automatic speech recognition (ASR), natural language processing (NLP), and advanced AI insights to provide 
                detailed analysis of video content.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="text-center">
                  <Zap className="mx-auto h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Fast Processing</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Rapid video analysis with real-time progress tracking
                  </p>
                </div>
                
                <div className="text-center">
                  <Shield className="mx-auto h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Advanced Analysis</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Multi-dimensional scoring for content, delivery, and impact
                  </p>
                </div>
                
                <div className="text-center">
                  <Heart className="mx-auto h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">AI Insights</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Emotional analysis, sentiment detection, and improvement suggestions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Key Features
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Analysis Capabilities</h3>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Video upload and URL processing</li>
                  <li>• OCR text extraction</li>
                  <li>• ASR speech recognition</li>
                  <li>• NLP content analysis</li>
                  <li>• Delivery assessment</li>
                  <li>• Impact measurement</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">AI-Powered Insights</h3>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Speaker identification</li>
                  <li>• Sentiment analysis</li>
                  <li>• Market impact assessment</li>
                  <li>• Improvement suggestions</li>
                  <li>• Emotional analysis via Hume AI</li>
                  <li>• Risk factor identification</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Reporting & Visualization</h3>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Interactive score visualizations</li>
                  <li>• Detailed slice analysis</li>
                  <li>• Downloadable PDF reports</li>
                  <li>• Highlight detection</li>
                  <li>• Volatility tracking</li>
                  <li>• Export capabilities</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">User Experience</h3>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Responsive design</li>
                  <li>• Dark/Light mode</li>
                  <li>• Real-time processing status</li>
                  <li>• Advanced filtering & search</li>
                  <li>• Configurable settings</li>
                  <li>• Accessibility optimized</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Server className="mr-2 h-5 w-5" />
                System Status
              </h2>
              <button
                onClick={fetchHealth}
                disabled={isLoading}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Checking...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-56" />
              </div>
            ) : connectionError ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                  Backend Disconnected
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {connectionError}
                </p>
              </div>
            ) : healthData ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                    Backend Connected
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="font-mono text-gray-900 dark:text-white capitalize">
                      {healthData.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Last Check:</span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {new Date(healthData.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Technology Stack
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Frontend</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-gray-600 dark:text-gray-400">React 18 with TypeScript</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <span className="text-gray-600 dark:text-gray-400">Vite for build tooling</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-teal-500 rounded-full" />
                    <span className="text-gray-600 dark:text-gray-400">Tailwind CSS for styling</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                    <span className="text-gray-600 dark:text-gray-400">React Router for navigation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-gray-600 dark:text-gray-400">Lucide React for icons</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                    <span className="text-gray-600 dark:text-gray-400">Recharts for visualizations</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Backend</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-gray-600 dark:text-gray-400">FastAPI Python framework</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <span className="text-gray-600 dark:text-gray-400">OCR processing engines</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-pink-500 rounded-full" />
                    <span className="text-gray-600 dark:text-gray-400">ASR speech recognition</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full" />
                    <span className="text-gray-600 dark:text-gray-400">NLP analysis pipeline</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <span className="text-gray-600 dark:text-gray-400">AI/ML model integration</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-violet-500 rounded-full" />
                    <span className="text-gray-600 dark:text-gray-400">Hume AI emotional analysis</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Built with <Heart className="inline h-4 w-4 text-red-500" /> using modern web technologies
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
            Version 2.0.0 • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}