import type { EvaluationMeasurement, EvaluationMeasurementInput, EvaluationSummary } from '../types/domain';
import { apiRequest, httpClient } from './apiClient';

export const evaluationService = {
  list: () => apiRequest<EvaluationMeasurement[]>('/evaluations/measurements'),
  summary: () => apiRequest<EvaluationSummary[]>('/evaluations/summary'),
  save: (payload: EvaluationMeasurementInput) => apiRequest<EvaluationMeasurement>('/evaluations/measurements', { method: 'POST', body: JSON.stringify(payload) }),
  exportWorkbook: async () => {
    const response = await httpClient.get<Blob>('/evaluations/export.xlsx', { responseType: 'blob' });
    const url = URL.createObjectURL(response.data); const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'ficha-evaluacion-o1-o2.xlsx'; anchor.click(); URL.revokeObjectURL(url);
  },
};
