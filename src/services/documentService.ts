import type {
  BackendDocument,
  BackendExtractedField,
  DocumentRecord,
  ExtractedField,
  OcrResult,
  ProcessingStatus,
  ProcessingJob,
} from '../types/domain';
import type { FieldValidationFormValues } from '../schemas/documents';
import { API_BASE_URL, apiRequest } from './apiClient';

export type DocumentFilters = {
  q?: string;
  documentTypeId?: string;
  fieldName?: string;
  fieldValue?: string;
};

function toNumber(value: string | number | undefined): number {
  if (value === undefined) return 0;
  return typeof value === 'number' ? value : Number(value);
}

function mapExtractedField(field: BackendExtractedField): ExtractedField {
  return {
    id: field.id,
    extractedFieldId: field.id,
    fieldDefinitionId: field.fieldDefinitionId,
    label: field.fieldDefinition.label,
    key: field.fieldDefinition.name,
    aiValue: field.aiValue,
    confidence: Math.round(toNumber(field.confidence) * 100),
    status: 'PENDING',
  };
}

export function mapDocument(document: BackendDocument): DocumentRecord {
  const validatedByDefinition = new Map(document.validatedFields?.map((field) => [field.fieldDefinitionId, field]) ?? []);
  const extractedFields = document.extractedFields ?? [];
  const fields = extractedFields.length
    ? extractedFields.map((field) => {
        const validated = validatedByDefinition.get(field.fieldDefinitionId);
        return {
          ...mapExtractedField(field),
          humanValue: validated?.finalValue,
          status: validated?.status ?? 'PENDING',
        };
      })
    : (document.validatedFields ?? []).map((field) => ({
        id: field.id,
        fieldDefinitionId: field.fieldDefinitionId,
        label: field.fieldDefinition.label,
        key: field.fieldDefinition.name,
        aiValue: field.extractedFieldId ? null : field.finalValue,
        humanValue: field.finalValue,
        confidence: 100,
        status: field.status,
      }));
  const finishedJobs = document.processingJobs?.filter((job) => job.finishedAt) ?? [];
  const confidence = fields.length ? Math.round(fields.reduce((sum, field) => sum + field.confidence, 0) / fields.length) : undefined;

  return {
    id: document.id,
    name: document.title,
    type: document.documentType?.name ?? document.documentType?.code ?? 'Document',
    organisation: String(document.metadata?.organisation ?? 'Current organisation'),
    status: document.status,
    uploadedAt: document.createdAt,
    processedAt: finishedJobs.at(-1)?.finishedAt ?? undefined,
    confidence,
    fields,
    processingJobs: document.processingJobs,
    fileUrl: document.uploadedFile ? `${API_BASE_URL}/documents/${document.id}/file` : undefined,
  };
}

function searchParams(filters: DocumentFilters) {
  return new URLSearchParams(
    Object.entries(filters).filter(([, value]) => Boolean(value)) as [string, string][],
  );
}

export const documentService = {
  list: (filters: DocumentFilters = {}) => {
    const params = searchParams(filters);
    return apiRequest<BackendDocument[]>(`/documents${params.toString() ? `?${params.toString()}` : ''}`).then((documents) => {
      return documents.map(mapDocument);
    });
  },
  get: (id: string) => apiRequest<BackendDocument>(`/documents/${id}`).then(mapDocument),
  getRaw: (id: string) => apiRequest<BackendDocument>(`/documents/${id}`),
  upload: (formData: FormData) =>
    apiRequest<BackendDocument>('/documents/upload', {
      method: 'POST',
      formData,
    }).then(mapDocument),
  runOcr: (documentId: string) =>
    apiRequest<{ job: ProcessingJob; ocrResult: OcrResult }>(`/ocr/documents/${documentId}/run`, {
      method: 'POST',
    }),
  processOcr: (documentId: string) =>
    apiRequest<{ job: ProcessingJob; ocrResult: OcrResult }>(`/documents/${documentId}/ocr/process`, {
      method: 'POST',
    }),
  getOcrResult: (documentId: string) => apiRequest<OcrResult>(`/documents/${documentId}/ocr-result`),
  getProcessingStatus: (documentId: string) => apiRequest<ProcessingStatus>(`/documents/${documentId}/processing-status`),
  runAiExtraction: (documentId: string) =>
    apiRequest<{ job: ProcessingJob; extracted: BackendExtractedField[] }>(`/ai-extraction/documents/${documentId}/run`, {
      method: 'POST',
    }),
  validate: (documentId: string, payload: FieldValidationFormValues) =>
    apiRequest<unknown>(`/validation/documents/${documentId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  processingHistory: () => documentService.list(),
};
