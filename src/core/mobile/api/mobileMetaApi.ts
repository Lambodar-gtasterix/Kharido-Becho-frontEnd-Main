import { API_BASE_URL } from '@shared/api/config';

export const mobileMetaApi = {
  getBrands: async (query: string = ''): Promise<string[]> => {
    const url = `${API_BASE_URL}/api/v1/mobile-meta/brands${query ? `?query=${encodeURIComponent(query)}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch brands');
    return response.json();
  },

  getModels: async (brand: string, query: string = ''): Promise<string[]> => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    params.append('brand', brand);
    const url = `${API_BASE_URL}/api/v1/mobile-meta/models?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch models');
    return response.json();
  },
};
