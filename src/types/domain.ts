export type UserRole = 'admin' | 'auditor' | 'validator' | 'viewer' | string;

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organisationId: string;
  permissions: string[];
};

export type BackendDocumentStatus =
  | 'UPLOADED'
  | 'OCR_PENDING'
  | 'OCR_COMPLETED'
  | 'OCR_FAILED'
  | 'EXTRACTION_PENDING'
  | 'EXTRACTION_COMPLETED'
  | 'VALIDATION_PENDING'
  | 'VALIDATED'
  | 'REJECTED';

export type ProcessingJobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export type DocumentStatus = BackendDocumentStatus | ProcessingJobStatus;

export type ValidationStatus = 'PENDING' | 'APPROVED' | 'CORRECTED' | 'REJECTED';

export type ExtractedField = {
  id: string;
  fieldDefinitionId: string;
  extractedFieldId?: string;
  label: string;
  key: string;
  aiValue: string | null;
  humanValue?: string;
  confidence: number;
  status: ValidationStatus;
};

export type DocumentRecord = {
  id: string;
  name: string;
  type: string;
  organisation: string;
  status: DocumentStatus;
  uploadedAt: string;
  processedAt?: string;
  confidence?: number;
  fileUrl?: string;
  fields?: ExtractedField[];
  processingJobs?: ProcessingJob[];
};

export type DashboardMetrics = {
  totalDocuments: number;
  pendingValidation: number;
  accuracyRate: number;
  processingQueue: number;
};

export type AuditEvent = {
  id: string;
  actor?: string | null;
  action: string;
  target: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type ReportRequest = {
  title: string;
  format: 'PDF' | 'XLSX';
  documentId?: string;
  criteria?: Record<string, unknown>;
};

export type Role = {
  id: string;
  name: string;
  permissions: string[];
};

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  isActive?: boolean;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
};

export type Organisation = {
  id: string;
  name: string;
  taxId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DocumentFieldDefinition = {
  id: string;
  documentTypeId: string;
  name: string;
  label: string;
  dataType: string;
  required: boolean;
  validationRegex?: string | null;
  extractionHint?: string | null;
  order: number;
};

export type DocumentType = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  fieldDefinitions: DocumentFieldDefinition[];
};

export type UploadedFile = {
  id: string;
  originalName: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
  createdAt: string;
};

export type ProcessingJob = {
  id: string;
  documentId: string;
  type: 'OCR' | 'AI_EXTRACTION' | 'RULE_EXTRACTION' | 'REPORT';
  status: ProcessingJobStatus;
  startedAt?: string | null;
  finishedAt?: string | null;
  durationMs?: number | null;
  errorMessage?: string | null;
  output: Record<string, unknown>;
  createdAt: string;
};

export type OcrResult = {
  id: string;
  documentId: string;
  processingJobId: string;
  rawText: string;
  language: string;
  confidence?: string | number | null;
  characterCount: number;
  processingTimeMs: number;
  status: ProcessingJobStatus;
  errorMessage?: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type ProcessingStatus = {
  documentId: string;
  documentStatus: BackendDocumentStatus;
  latestJob: ProcessingJob | null;
  ocrJob: ProcessingJob | null;
  aiExtractionJob: ProcessingJob | null;
  processingJob?: ProcessingJob | null;
  ocrResult: Pick<OcrResult, 'id' | 'status' | 'language' | 'characterCount' | 'processingTimeMs' | 'errorMessage'> | null;
};

export type BackendExtractedField = {
  id: string;
  fieldDefinitionId: string;
  fieldDefinition: DocumentFieldDefinition;
  aiValue: string | null;
  confidence: string | number;
  source: string;
  rawPayload: Record<string, unknown>;
  createdAt: string;
};

export type BackendValidatedField = {
  id: string;
  extractedFieldId?: string | null;
  fieldDefinitionId: string;
  fieldDefinition: DocumentFieldDefinition;
  finalValue: string;
  correctedValue?: string | null;
  status: ValidationStatus;
};

export type BackendDocument = {
  id: string;
  title: string;
  status: BackendDocumentStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  documentType?: DocumentType;
  uploadedFile?: UploadedFile | null;
  extractedFields?: BackendExtractedField[];
  validatedFields?: BackendValidatedField[];
  processingJobs?: ProcessingJob[];
};

export type Report = {
  id: string;
  title: string;
  format: 'PDF' | 'XLSX';
  documentId?: string | null;
  storageKey?: string | null;
  durationMs?: number | null;
  createdAt: string;
};

export type EvaluationMoment = 'PRETEST' | 'POSTTEST';
export type EvaluationActivity = 'REGISTRATION' | 'SEARCH' | 'TRANSCRIPTION' | 'OCR_EXTRACTION' | 'REPORT_GENERATION';
export type EvaluationRecordStatus = 'COMPLETE' | 'INCOMPLETE' | 'UNAVAILABLE';

export type EvaluationMeasurementInput = {
  measurementCode: string; manifestCode?: string; measuredAt: string; measurerCode: string;
  moment: EvaluationMoment; activity: EvaluationActivity; status: EvaluationRecordStatus;
  observation?: string; startedAt?: string; finishedAt?: string; searchedData?: string;
  resultFound?: boolean; totalFields?: number; fieldsWithError?: number; omittedFields?: number;
  correctedFields?: number; finalErrors?: number; correctWithoutCorrection?: number;
  errorTypes?: string[]; qualityTags?: string[]; reportType?: string; reportScope?: string;
};

export type EvaluationMeasurement = EvaluationMeasurementInput & { id: string; durationMinutes?: string | number | null; createdAt: string; updatedAt: string };
export type EvaluationSummary = {
  objective: string; activity: EvaluationActivity; n: number; validPairs: number; meanPre: number | null; meanPost: number | null;
  meanDifference: number | null; improvementPercent: number | null; minimum: number | null; maximum: number | null;
  standardDeviation: number | null; complete: boolean; suggestedTest: string; reason: string;
};
