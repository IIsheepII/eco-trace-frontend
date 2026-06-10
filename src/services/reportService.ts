import type { Report, ReportRequest } from '../types/domain';
import { apiRequest } from './apiClient';

export const reportService = {
  list: () => apiRequest<Report[]>('/reports'),
  create: (payload: ReportRequest) => {
    const normalized = { ...payload, documentId: payload.documentId || undefined };
    return apiRequest<Report>('/reports', {
      method: 'POST',
      body: JSON.stringify(normalized),
    });
  },
};
