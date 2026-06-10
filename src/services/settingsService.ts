import { apiRequest } from './apiClient';

export type Setting = {
  id: string;
  key: string;
  value: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export const settingsService = {
  list: () => apiRequest<Setting[]>('/settings'),
};
