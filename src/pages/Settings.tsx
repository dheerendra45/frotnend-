import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Server, Palette, Save, RotateCcw } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { getHealth } from '../api/client';
import { HealthResponse } from '../types/api';
import toast from 'react-hot-toast';

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [apiBaseUrl, setApiBaseUrl] = useState(
    localStorage.getItem('attackedai-api-url') || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  );
  const [tempApiUrl, setTempApiUrl] = useState(apiBaseUrl);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setIsTestingConnection(true);
      setConnectionStatus('unknown');
      
      // Temporarily override the API base URL for testing
      const originalApiUrl = (window as any).__ATTACKED_AI_API_URL__;
      (window as any).__ATTACKED_AI_API_URL__ = tempApiUrl;
      
      const health = await getHealth();
      setHealthData(health);
      setConnectionStatus('success');
      
      // Restore original URL
      (window as any).__ATTACKED_AI_API_URL__ = originalApiUrl;
      
    } catch (err) {
      setConnectionStatus('error');
      setHealthData(null);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveApiUrl = () => {
    try {
      localStorage.setItem('attackedai-api-url', tempApiUrl);
      setApiBaseUrl(tempApiUrl);
      
      // Update the global API URL
      (window as any).__ATTACKED_AI_API_URL__ = tempApiUrl;
      
      toast.success('API URL saved successfully!');
      
      // Test the new connection
      testConnection();
    } catch (err) {
      toast.error('Failed to save API URL');
    }
  };

  const handleResetApiUrl = () => {
    const defaultUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    setTempApiUrl(defaultUrl);
    localStorage.removeItem('attackedai-api-url');
    setApiBaseUrl(defaultUrl);
    (window as any).__ATTACKED_AI_API_URL__ = defaultUrl;
    toast.success('API URL reset to default');
    testConnection();
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'success':
        return 'Connected';
      case 'error':
        return 'Connection failed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure your application preferences and connections
        </p>
      </div>

      <div className="space-y-8">
        {/* API Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Server className="mr-2 h-5 w-5" />
              API Configuration
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Backend API Base URL
              </label>
              <div className="flex space-x-3">
                <input
                  type="url"
                  value={tempApiUrl}
                  onChange={(e) => setTempApiUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={testConnection}
                  disabled={isTestingConnection}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  {isTestingConnection ? 'Testing...' : 'Test'}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                The base URL for the AttackedAI backend API
              </p>
            </div>

            {/* Connection Status */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Connection Status:
                </span>
                <span className={`text-sm font-medium ${getConnectionStatusColor()}`}>
                  {getConnectionStatusText()}
                </span>
              </div>
              
              {healthData && (
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div>Status: {healthData.status}</div>
                  <div>Timestamp: {new Date(healthData.timestamp).toLocaleString()}</div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSaveApiUrl}
                disabled={tempApiUrl === apiBaseUrl}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </button>
              
              <button
                onClick={handleResetApiUrl}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Default
              </button>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              Appearance
            </h2>
          </div>
          
          <div className="p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => theme === 'dark' && toggleTheme()}
                  className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                    theme === 'light'
                      ? 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-200'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => theme === 'light' && toggleTheme()}
                  className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-200'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Dark
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Choose between light and dark modes
              </p>
            </div>
          </div>
        </div>

        {/* Storage Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Local Storage
            </h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">API Base URL:</span>
                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
                  {apiBaseUrl}
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Theme:</span>
                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
                  {theme}
                </code>
              </div>
            </div>
            
            <button
              onClick={() => {
                localStorage.clear();
                toast.success('Local storage cleared');
                setTimeout(() => window.location.reload(), 1000);
              }}
              className="mt-4 px-4 py-2 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-200 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              Clear All Local Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}