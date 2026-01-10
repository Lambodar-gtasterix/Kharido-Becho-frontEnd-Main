import api from '@shared/api/client';

export interface MobileModel {
  modelId: number;
  name: string;
  brandId: number;
}

type GetModelsResponse = MobileModel[] | { data?: MobileModel[] };

export const getModels = async (brandId: number): Promise<MobileModel[]> => {
  const response = await api.get<GetModelsResponse>(`/api/v1/mobile-meta/models?brandId=${brandId}`);

  if (Array.isArray(response.data)) {
    return response.data;
  }

  const payload: GetModelsResponse = response.data;
  if (payload && Array.isArray((payload as { data?: MobileModel[] }).data)) {
    return (payload as { data?: MobileModel[] }).data ?? [];
  }

  return [];
};
