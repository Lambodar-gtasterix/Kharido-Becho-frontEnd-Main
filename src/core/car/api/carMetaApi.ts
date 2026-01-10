import { API_BASE_URL } from '@shared/api/config';

interface BrandResponse {
  message: string;
  data: Array<{ brand: string }>;
  exception: string;
}

interface VariantResponse {
  message: string;
  data: string[];
  exception: string;
}

interface SubVariantResponse {
  message: string;
  data: string[];
  exception: string;
}

export const carMetaApi = {
  getBrands: async (): Promise<string[]> => {
    const url = `${API_BASE_URL}/car/brands/only-brands`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch brands');
    const data: BrandResponse = await response.json();
    return data.data.map(item => item.brand);
  },

  getVariants: async (brand: string): Promise<string[]> => {
    const url = `${API_BASE_URL}/car/brands/variants?brand=${encodeURIComponent(brand)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch variants');
    const data: VariantResponse = await response.json();
    return data.data;
  },

  getSubVariants: async (brand: string, variant: string): Promise<string[]> => {
    const url = `${API_BASE_URL}/car/brands/sub-variants?brand=${encodeURIComponent(brand)}&variant=${encodeURIComponent(variant)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch sub-variants');
    const data: SubVariantResponse = await response.json();
    return data.data;
  },
};
