import { useState, useEffect, useCallback, useRef } from 'react';
import { getJob } from '../api/client';
import { JobStatus } from '../types/api';
import toast from 'react-hot-toast';

export function useJobPolling(jobId: string | null) {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const lastProgressRef = useRef<number | null>(null);
  const stagnantTicksRef = useRef<number>(0);

  const pollJob = useCallback(async () => {
    if (!jobId) return;

    try {
      setError(null);
      const status = await getJob(jobId);
      setJobStatus(status);
      // Debug trace
      console.debug('[useJobPolling] status', { jobId, status });

      if (status.status === 'SUCCESS' || status.status === 'FAILURE') {
        setIsPolling(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (status.status === 'FAILURE') {
          toast.error(status.error || 'Job failed');
        } else {
          toast.success('Processing completed!');
        }
      }

      // Watchdog: detect stagnation (no progress change) for ~60s (30 ticks @ 2s)
      if (lastProgressRef.current === status.progress) {
        stagnantTicksRef.current += 1;
      } else {
        stagnantTicksRef.current = 0;
        lastProgressRef.current = status.progress;
      }

      if (stagnantTicksRef.current >= 30 && status.status === 'PROCESSING') {
        // Stop polling to avoid infinite spinner; surface a warning
        console.warn('[useJobPolling] Stagnant progress detected, stopping polling');
        setIsPolling(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        toast.error('Processing stalled. Please retry or check server logs.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job status');
      setIsPolling(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      toast.error('Failed to check job status');
    }
  }, [jobId]);

  useEffect(() => {
    if (!jobId) {
      setJobStatus(null);
      setIsPolling(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    setIsPolling(true);
    // reset watchdog state
    lastProgressRef.current = null;
    stagnantTicksRef.current = 0;

    // immediate poll, then set interval
    pollJob();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = window.setInterval(pollJob, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [jobId, pollJob]);

  return { jobStatus, isPolling, error };
}