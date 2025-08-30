import React from 'react';

interface TimecodeProps {
  seconds: number;
  showMs?: boolean;
}

export function Timecode({ seconds, showMs = false }: TimecodeProps) {
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    const ms = Math.floor((totalSeconds % 1) * 1000);

    if (hours > 0) {
      const timeStr = `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      return showMs ? `${timeStr}.${ms.toString().padStart(3, '0')}` : timeStr;
    }
    
    const timeStr = `${minutes}:${secs.toString().padStart(2, '0')}`;
    return showMs ? `${timeStr}.${ms.toString().padStart(3, '0')}` : timeStr;
  };

  return (
    <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
      {formatTime(seconds)}
    </span>
  );
}

interface TimecodeRangeProps {
  startSeconds: number;
  endSeconds: number;
  showMs?: boolean;
}

export function TimecodeRange({ startSeconds, endSeconds, showMs = false }: TimecodeRangeProps) {
  return (
    <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
      <Timecode seconds={startSeconds} showMs={showMs} />
      {' – '}
      <Timecode seconds={endSeconds} showMs={showMs} />
    </span>
  );
}