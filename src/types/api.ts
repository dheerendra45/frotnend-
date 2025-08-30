export interface BriefingListItem {
  id: string;
  video_src: string;
  scores: Record<string, number>;
  created_at: string;
}

export interface BriefingSummary {
  id: string;
  video_src: string;
  duration_s: number;
  slice_len_s: number;
  scores: {
    content: number;
    delivery: number;
    impact: number;
    composite: number;
    [key: string]: any;
  };
  highlights: Array<{
    t_start: number;
    t_end: number;
    risk_tags: string[];
    note: string;
  }>;
  volatility: {
    content: number;
    delivery: number;
    impact: number;
  };
  created_at: string;
  ai?: {
    speaker?: string | null;
    sentiment?: any;
    market_impact?: any;
    suggestions?: any;
    hume?: any;
    report_key?: string | null;
    pressguard?: any;
  } | null;
  report_url?: string | null;
}

export interface SliceRow {
  id: string;
  t_start: number;
  t_end: number;
  transcript: string;
  risk_tags: string[];
  metrics: Record<string, any>;
  au_signals?: Record<string, any>;
  thumbnails?: string[];
}

export interface JobResponse {
  job_id: string;
}

export interface JobStatus {
  job_id: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILURE';
  progress: number;
  error?: string;
  briefing_id?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}