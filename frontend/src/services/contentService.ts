import { apiClient } from './apiClient';
import type {
  Post,
  ContentFeedResponse,
  InteractionRequest,
  InteractionResponse,
} from '../types/api';

export const contentService = {
  async getFeed(limit = 20, offset = 0, category?: string): Promise<ContentFeedResponse> {
    const res = await apiClient.get<ContentFeedResponse>('/content/feed', {
      params: { limit, offset, ...(category ? { category } : {}) },
    });
    return res.data;
  },

  async getNew(limit = 30): Promise<Post[]> {
    const res = await apiClient.get<ContentFeedResponse>('/content/new', {
      params: { limit },
    });
    return res.data.posts ?? res.data as unknown as Post[];
  },

  async getTrending(limit = 20): Promise<Post[]> {
    const res = await apiClient.get<ContentFeedResponse>('/content/trending', {
      params: { limit },
    });
    return res.data.posts ?? res.data as unknown as Post[];
  },

  async interact(postId: string, data: InteractionRequest): Promise<InteractionResponse> {
    const res = await apiClient.post<InteractionResponse>(
      `/content/${postId}/interact`,
      data
    );
    return res.data;
  },

  async getFavorites(): Promise<Post[]> {
    const res = await apiClient.get<Post[]>('/content/favorites');
    return res.data;
  },
};
