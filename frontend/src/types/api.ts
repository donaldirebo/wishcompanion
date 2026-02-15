export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Post {
  id: string;
  external_id: string;
  source: 'youtube' | 'reddit';
  title: string;
  content_url: string;
  content_type: 'image' | 'video';
  tags: string[];
  post_metadata: Record<string, any>;
  sentiment_score: number | null;
  created_at: string;
}

export interface ContentFeedResponse {
  posts: Post[];
  total: number;
  has_more: boolean;
}

export interface InteractionRequest {
  interaction_type: 'like' | 'dislike' | 'save' | 'share';
  dwell_time_seconds?: number;
}
