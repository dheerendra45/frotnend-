import { APIError, BriefingListItem, BriefingSummary, SliceRow, JobResponse, JobStatus, HealthResponse } from '../types/api';

// Allow runtime override via global variable (for settings page)
export const API_BASE_URL = (window as any).__ATTACKED_AI_API_URL__ || 
                            localStorage.getItem('attackedai-api-url') || 
                            import.meta.env.VITE_API_BASE_URL || 
                            'http://localhost:8000';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new APIError(response.status, errorMessage);
  }

  try {
    return await response.json();
  } catch {
    throw new APIError(response.status, 'Invalid JSON response');
  }
}

function getApiUrl(): string {
  return (window as any).__ATTACKED_AI_API_URL__ || 
         localStorage.getItem('attackedai-api-url') || 
         import.meta.env.VITE_API_BASE_URL || 
         'http://localhost:8000';
}

export async function submitJob(
  file?: File,
  url?: string,
  opts?: { fullLLM?: boolean; narrativeLength?: number; fastMode?: boolean }
): Promise<JobResponse> {
  const baseUrl = getApiUrl();
  const formData = new FormData();
  
  if (file) {
    formData.append('file', file);
  } else if (url) {
    // For URL submission, API expects query param: video_url
    const u = new URL(`${baseUrl}/v1/jobs`);
    u.searchParams.set('video_url', url);
    if (opts?.fullLLM) u.searchParams.set('full_llm_mode', 'true');
    if (opts?.narrativeLength && opts.narrativeLength > 0) {
      u.searchParams.set('narrative_length', String(opts.narrativeLength));
    }
    if (opts?.fastMode) u.searchParams.set('fast_mode', 'true');
    const response = await fetch(u.toString(), {
      method: 'POST',
    });
    const raw = await handleResponse<any>(response);
    const normalized: JobResponse = {
      job_id: raw?.job_id ?? raw?.id ?? raw?.jobId ?? ''
    };
    if (!normalized.job_id) {
      throw new APIError(response.status, 'Invalid job response: missing job_id');
    }
    return normalized;
  } else {
    throw new Error('Either file or URL must be provided');
  }

  const u = new URL(`${baseUrl}/v1/jobs`);
  if (opts?.fullLLM) u.searchParams.set('full_llm_mode', 'true');
  if (opts?.narrativeLength && opts.narrativeLength > 0) {
    u.searchParams.set('narrative_length', String(opts.narrativeLength));
  }
  if (opts?.fastMode) u.searchParams.set('fast_mode', 'true');

  const response = await fetch(u.toString(), {
    method: 'POST',
    body: formData,
  });
  const raw = await handleResponse<any>(response);
  const normalized: JobResponse = {
    job_id: raw?.job_id ?? raw?.id ?? raw?.jobId ?? ''
  };
  if (!normalized.job_id) {
    throw new APIError(response.status, 'Invalid job response: missing job_id');
  }
  return normalized;
}

export async function getJob(jobId: string): Promise<JobStatus> {
  const baseUrl = getApiUrl();
  const response = await fetch(`${baseUrl}/v1/jobs/${jobId}`);
  return handleResponse<JobStatus>(response);
}

export async function listBriefings(): Promise<BriefingListItem[]> {
  const baseUrl = getApiUrl();
  const response = await fetch(`${baseUrl}/v1/briefings`);
  return handleResponse<BriefingListItem[]>(response);
}

export async function getBriefing(id: string): Promise<BriefingSummary> {
  const baseUrl = getApiUrl();
  const response = await fetch(`${baseUrl}/v1/briefings/${id}`);
  return handleResponse<BriefingSummary>(response);
}

export async function getPressguard(briefingId: string): Promise<any> {
  const baseUrl = getApiUrl();
  const response = await fetch(`${baseUrl}/v1/briefings/${briefingId}/pressguard`);
  return handleResponse<any>(response);
}

export async function getSlices(briefingId: string): Promise<SliceRow[]> {
  const baseUrl = getApiUrl();
  const response = await fetch(`${baseUrl}/v1/briefings/${briefingId}/slices`);
  return handleResponse<SliceRow[]>(response);
}

export function getReportUrl(
  briefingId: string,
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  const baseUrl = getApiUrl();
  const url = new URL(`${baseUrl}/v1/briefings/${briefingId}/report`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && `${v}`.length > 0) {
        url.searchParams.set(k, String(v));
      }
    });
  }
  return url.toString();
}

export async function getHealth(): Promise<HealthResponse> {
  const baseUrl = getApiUrl();
  try {
    const response = await fetch(`${baseUrl}/v1/health`);
    return handleResponse<HealthResponse>(response);
  } catch {
    return {
      status: 'unknown',
      timestamp: new Date().toISOString(),
    };
  }
}