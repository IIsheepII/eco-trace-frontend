import type { DashboardMetrics, DocumentRecord } from '../types/domain';
import { apiRequest } from './apiClient';
import { mapDocument } from './documentService';
import type { BackendDocument } from '../types/domain';

type Metric = {
  id: string;
  name: string;
  value: string | number;
};

export const dashboardService = {
  metrics: async (includeMetrics = true): Promise<DashboardMetrics> => {
    const [documents, metrics] = await Promise.all([
      apiRequest<BackendDocument[]>('/documents'),
      includeMetrics ? apiRequest<Metric[]>('/metrics') : Promise.resolve([]),
    ]);
    const mapped = documents.map(mapDocument);
    const accuracy = metrics
      .filter((metric) => metric.name === 'extraction_accuracy')
      .map((metric) => Number(metric.value));
    return {
      totalDocuments: mapped.length,
      pendingValidation: mapped.filter((document) => document.status === 'VALIDATION_PENDING').length,
      accuracyRate: accuracy.length ? Math.round(accuracy.reduce((sum, value) => sum + value, 0) / accuracy.length) : 0,
      processingQueue: mapped.filter((document) => ['OCR_PENDING', 'EXTRACTION_PENDING'].includes(document.status)).length,
    };
  },
  activity: () => apiRequest<BackendDocument[]>('/documents').then((documents): DocumentRecord[] => documents.slice(0, 10).map(mapDocument)),
};
