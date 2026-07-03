import { Chip } from '@mui/material';
import type { DocumentStatus, ValidationStatus } from '../types/domain';

const statusMap: Record<DocumentStatus | ValidationStatus, { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' }> = {
  UPLOADED: { label: 'Uploaded', color: 'default' },
  OCR_PENDING: { label: 'OCR pending', color: 'primary' },
  OCR_COMPLETED: { label: 'OCR complete', color: 'success' },
  OCR_FAILED: { label: 'OCR failed', color: 'error' },
  EXTRACTION_PENDING: { label: 'Extraction pending', color: 'primary' },
  EXTRACTION_COMPLETED: { label: 'Extraction complete', color: 'success' },
  VALIDATION_PENDING: { label: 'Needs validation', color: 'warning' },
  VALIDATED: { label: 'Validated', color: 'success' },
  REJECTED: { label: 'Rejected', color: 'error' },
  QUEUED: { label: 'Queued', color: 'default' },
  RUNNING: { label: 'Running', color: 'primary' },
  COMPLETED: { label: 'Completed', color: 'success' },
  FAILED: { label: 'Failed', color: 'error' },
  PENDING: { label: 'Pending', color: 'default' },
  APPROVED: { label: 'Approved', color: 'success' },
  CORRECTED: { label: 'Corrected', color: 'warning' },
};

export function StatusChip({ status }: { status: DocumentStatus | ValidationStatus }) {
  const config = statusMap[status];
  return <Chip size="small" label={config.label} color={config.color} sx={{ borderRadius: 999 }} />;
}
