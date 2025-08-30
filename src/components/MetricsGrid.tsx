import React from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3, Zap } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}

function MetricCard({ title, value, change, icon, color, trend = 'neutral' }: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 animate-float`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${color} shadow-lg`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-white font-bold text-2xl mb-1 font-display">{value}</h3>
      <p className="text-gray-400 text-sm font-medium">{title}</p>
    </div>
  );
}

interface MetricsGridProps {
  briefings: any[];
}

export function MetricsGrid({ briefings }: MetricsGridProps) {
  const totalBriefings = briefings.length;
  
  const highRiskCount = briefings.filter(b => 
    (b.scores?.composite || 0) < 0.5
  ).length;
  
  const processingEfficiency = briefings.length > 0 
    ? (briefings.filter(b => b.status === 'completed').length / briefings.length) * 100 
    : 0;

  const metrics = [
    {
      title: 'Total Briefings',
      value: totalBriefings.toLocaleString(),
      change: 12.5,
      trend: 'up' as const,
      icon: <BarChart3 className="w-6 h-6 text-white" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'High Risk Items',
      value: highRiskCount,
      change: -15.3,
      trend: 'down' as const,
      icon: <Zap className="w-6 h-6 text-white" />,
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'Processing Efficiency',
      value: `${processingEfficiency.toFixed(1)}%`,
      change: 5.7,
      trend: 'up' as const,
      icon: <Activity className="w-6 h-6 text-white" />,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Volatility Index',
      value: (Math.random() * 50 + 25).toFixed(1),
      change: Math.random() * 20 - 10,
      trend: Math.random() > 0.5 ? 'up' as const : 'down' as const,
      icon: <Activity className="w-6 h-6 text-white" />,
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          trend={metric.trend}
          icon={metric.icon}
          color={metric.color}
        />
      ))}
    </div>
  );
}
