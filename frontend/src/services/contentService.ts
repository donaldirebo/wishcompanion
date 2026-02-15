import { apiClient } from './api';
import type { Post, ContentFeedResponse, InteractionRequest } from '../types/api';

export const contentService = {
  async getFeed(limit = 20, offset = 0, category?: string): Promise<ContentFeedResponse> {
    const params: any = { limit, offset };
    if (category) params.category = category;
    const response = await apiClient.get<ContentFeedResponse>('/content/feed', { params });
    return response.data;
  },

  async getNew(limit = 20): Promise<Post[]> {
    const response = await apiClient.get<Post[]>('/content/new', { params: { limit } });
    return response.data;
  },

  async getTrending(limit = 20): Promise<Post[]> {
    const response = await apiClient.get<Post[]>('/content/trending', { params: { limit } });
    return response.data;
  },

  async interact(postId: string, interaction: InteractionRequest): Promise<void> {
    await apiClient.post(`/content/${postId}/interact`, interaction);
  },

  async getFavorites(): Promise<Post[]> {
    const response = await apiClient.get<Post[]>('/content/favorites');
    return response.data;
  },
};
