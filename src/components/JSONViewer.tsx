import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

interface JSONViewerProps {
  data: any;
  title?: string;
}

export function JSONViewer({ data, title }: JSONViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  const renderValue = (value: any, key?: string, depth = 0): React.ReactNode => {
    const indent = '  '.repeat(depth);
    
    if (value === null || value === undefined) {
      return <span className="text-gray-500 dark:text-gray-400">null</span>;
    }
    
    if (typeof value === 'boolean') {
      return <span className="text-purple-600 dark:text-purple-400">{value.toString()}</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="text-blue-600 dark:text-blue-400">{value}</span>;
    }
    
    if (typeof value === 'string') {
      return <span className="text-green-600 dark:text-green-400">"{value}"</span>;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-600 dark:text-gray-300">[]</span>;
      }
      return (
        <div>
          <span className="text-gray-600 dark:text-gray-300">[</span>
          {value.map((item, index) => (
            <div key={index} className="ml-4">
              {renderValue(item, undefined, depth + 1)}
              {index < value.length - 1 && <span className="text-gray-600 dark:text-gray-300">,</span>}
            </div>
          ))}
          <span className="text-gray-600 dark:text-gray-300">]</span>
        </div>
      );
    }
    
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return <span className="text-gray-600 dark:text-gray-300">{'{}'}</span>;
      }
      return (
        <div>
          <span className="text-gray-600 dark:text-gray-300">{'{'}</span>
          {keys.map((objKey, index) => (
            <div key={objKey} className="ml-4">
              <span className="text-red-600 dark:text-red-400">"{objKey}"</span>
              <span className="text-gray-600 dark:text-gray-300">: </span>
              {renderValue(value[objKey], objKey, depth + 1)}
              {index < keys.length - 1 && <span className="text-gray-600 dark:text-gray-300">,</span>}
            </div>
          ))}
          <span className="text-gray-600 dark:text-gray-300">{'}'}</span>
        </div>
      );
    }
    
    return <span>{String(value)}</span>;
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
      <div 
        className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
          <span className="font-medium text-gray-900 dark:text-white">
            {title || 'JSON Data'}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 font-mono text-sm overflow-auto">
          {renderValue(data)}
        </div>
      )}
    </div>
  );
}