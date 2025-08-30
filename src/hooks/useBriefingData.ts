import { useState, useEffect } from 'react';
import { getBriefing } from '../api/client';
import { BriefingSummary } from '../types/api';

interface UseBriefingDataReturn {
  briefing: BriefingSummary | null;
  pressguardData: any | null;
  slices: any[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBriefingData(briefingId: string): UseBriefingDataReturn {
  const [briefing, setBriefing] = useState<BriefingSummary | null>(null);
  const [pressguardData, setPressguardData] = useState<any | null>(null);
  const [slices, setSlices] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Fetch briefing details in parallel
      const [briefingData, slicesData, pressguardResponse] = await Promise.allSettled([
        getBriefing(briefingId),
        fetch(`/api/v1/briefings/${briefingId}/slices`).then(res => res.json()),
        fetch(`/api/v1/briefings/${briefingId}/pressguard`).then(res => res.json())
      ]);

      // Handle briefing data
      if (briefingData.status === 'fulfilled') {
        setBriefing(briefingData.value);
      } else {
        throw new Error('Failed to fetch briefing details');
      }

      // Handle slices data
      if (slicesData.status === 'fulfilled') {
        setSlices(slicesData.value);
      } else {
        console.warn('Failed to fetch slices data:', slicesData.reason);
        setSlices([]);
      }

      // Handle PressGuard data
      if (pressguardResponse.status === 'fulfilled') {
        setPressguardData(pressguardResponse.value);
      } else {
        console.warn('Failed to fetch PressGuard data:', pressguardResponse.reason);
        // Fallback to AI data from briefing
        const aiData = briefingData.status === 'fulfilled' ? briefingData.value.ai : null;
        setPressguardData(aiData?.pressguard || null);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load briefing data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (briefingId) {
      fetchData();
    }
  }, [briefingId]);

  return {
    briefing,
    pressguardData,
    slices,
    isLoading,
    error,
    refetch: fetchData
  };
}
