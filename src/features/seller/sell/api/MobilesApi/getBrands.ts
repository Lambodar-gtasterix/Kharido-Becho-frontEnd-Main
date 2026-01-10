import api from '@shared/api/client';

export interface MobileBrand {
  brandId: number;
  name: string;
}

type GetBrandsResponse = MobileBrand[] | { data?: MobileBrand[] };

export const getBrands = async (): Promise<MobileBrand[]> => {
  const response = await api.get<GetBrandsResponse>('/api/v1/mobile-meta/brands');
  if (Array.isArray(response.data)) {
    return response.data;
  }
  const payload: GetBrandsResponse = response.data;
  if (payload && Array.isArray((payload as { data?: MobileBrand[] }).data)) {
    return (payload as { data?: MobileBrand[] }).data ?? [];
  }
  return [];
};
