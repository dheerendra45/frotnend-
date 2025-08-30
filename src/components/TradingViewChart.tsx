import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TradingViewChartProps {
  data: Array<{
    time: string;
    price: number;
    volume: number;
    sentiment: number;
  }>;
  title: string;
}

export function TradingViewChart({ data, title }: TradingViewChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-xl">
          <p className="text-white font-bold mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-green-400">
              Price: <span className="font-bold">${payload[0]?.value?.toFixed(2)}</span>
            </p>
            <p className="text-blue-400">
              Volume: <span className="font-bold">{payload[1]?.value?.toLocaleString()}</span>
            </p>
            <p className="text-purple-400">
              Sentiment: <span className="font-bold">{(payload[2]?.value * 100)?.toFixed(1)}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white font-display">{title}</h3>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">Price</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-blue-400 text-sm font-medium">Volume</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-purple-400 text-sm font-medium">Sentiment</span>
          </div>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: '#ffffff' }}
            />
            <YAxis 
              yAxisId="price"
              orientation="left"
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: '#ffffff' }}
            />
            <YAxis 
              yAxisId="volume"
              orientation="right"
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: '#ffffff' }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Bar 
              yAxisId="volume"
              dataKey="volume" 
              fill="#3b82f6"
              fillOpacity={0.3}
              radius={[2, 2, 0, 0]}
            />
            
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
            />
            
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="sentiment"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#8b5cf6', strokeWidth: 2, fill: '#ffffff' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-green-400 text-lg font-bold">
            ${data[data.length - 1]?.price?.toFixed(2) || '0.00'}
          </p>
          <p className="text-gray-400 text-sm">Current Price</p>
        </div>
        <div className="text-center">
          <p className="text-blue-400 text-lg font-bold">
            {data[data.length - 1]?.volume?.toLocaleString() || '0'}
          </p>
          <p className="text-gray-400 text-sm">Volume</p>
        </div>
        <div className="text-center">
          <p className="text-purple-400 text-lg font-bold">
            {((data[data.length - 1]?.sentiment || 0) * 100).toFixed(1)}%
          </p>
          <p className="text-gray-400 text-sm">Sentiment</p>
        </div>
      </div>
    </div>
  );
}
