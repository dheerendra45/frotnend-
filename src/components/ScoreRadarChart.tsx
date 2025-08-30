import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

interface ScoreRadarChartProps {
  scores: {
    content: number;
    delivery: number;
    impact: number;
  };
  className?: string;
}

export function ScoreRadarChart({ scores, className = '' }: ScoreRadarChartProps) {
  const data = [
    { subject: 'Content', score: scores.content },
    { subject: 'Delivery', score: scores.delivery },
    { subject: 'Impact', score: scores.impact },
  ];

  return (
    <div className={`${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid className="stroke-gray-200 dark:stroke-gray-700" />
          <PolarAngleAxis 
            dataKey="subject" 
            className="fill-gray-600 dark:fill-gray-300 text-sm"
          />
          <PolarRadiusAxis 
            domain={[0, 10]} 
            className="fill-gray-400 dark:fill-gray-500 text-xs"
          />
          <Radar
            name="Scores"
            dataKey="score"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.1}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}