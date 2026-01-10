import { API_BASE_URL } from './config';

export const locationApi = {
  getStates: async (): Promise<string[]> => {
    const url = `${API_BASE_URL}/bikes/location/states`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch states');
    const data: string[] = await response.json();
    return data;
    console.log(url);
  },

  getCities: async (state: string): Promise<string[]> => {
    const url = `${API_BASE_URL}/bikes/location/cities?state=${encodeURIComponent(state)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch cities');
    const data: string[] = await response.json();
    return data;
  },

  getLocalities: async (state: string, city: string): Promise<string[]> => {
    const url = `${API_BASE_URL}/bikes/location/localities?state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch localities');
    const data: string[] = await response.json();
    return data;
  },
};
