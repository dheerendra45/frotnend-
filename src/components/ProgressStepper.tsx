import React from 'react';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

interface Step {
  label: string;
  status: 'completed' | 'current' | 'pending';
}

interface ProgressStepperProps {
  steps: Step[];
  progress?: number;
}

export function ProgressStepper({ steps, progress }: ProgressStepperProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center space-x-3">
          {step.status === 'completed' && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          {step.status === 'current' && (
            <div className="relative">
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            </div>
          )}
          {step.status === 'pending' && (
            <Circle className="h-5 w-5 text-gray-300 dark:text-gray-600" />
          )}
          
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              step.status === 'completed' 
                ? 'text-green-600 dark:text-green-400'
                : step.status === 'current'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {step.label}
            </p>
            {step.status === 'current' && progress !== undefined && (
              <div className="mt-1">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {progress.toFixed(0)}% complete
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}