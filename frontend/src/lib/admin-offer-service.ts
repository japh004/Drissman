import { apiClient } from "@/lib/api-client";

export interface AdminOfferDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  hours: number;
  permitType: string;
}

export interface OfferModuleDto {
  moduleId: string;
  moduleName: string;
  moduleCategory: "CODE" | "CONDUITE" | "EXAMEN_BLANC";
  moduleRequiredHours: number;
  orderIndex: number;
}

export interface CreateAdminOfferPayload {
  name: string;
  description?: string;
  price: number;
  hours: number;
  permitType: string;
}

export const adminOfferService = {
  list: (token: string) => apiClient.get<AdminOfferDto[]>("/schools/admin/offers", token),
  create: (payload: CreateAdminOfferPayload, token: string) =>
    apiClient.post<AdminOfferDto>("/schools/admin/offers", payload, token),
  update: (offerId: string, payload: Partial<CreateAdminOfferPayload>, token: string) =>
    apiClient.patch<AdminOfferDto>(`/schools/admin/offers/${offerId}`, payload, token),
  remove: (offerId: string, token: string) => apiClient.delete<void>(`/schools/admin/offers/${offerId}`, token),
  getModules: (offerId: string, token: string) => apiClient.get<OfferModuleDto[]>(`/offers/${offerId}/modules`, token),
  setModules: (offerId: string, moduleIds: string[], token: string) =>
    apiClient.put<OfferModuleDto[]>(
      `/schools/admin/offers/${offerId}/modules`,
      { modules: moduleIds.map((moduleId, idx) => ({ moduleId, orderIndex: idx })) },
      token,
    ),
};
