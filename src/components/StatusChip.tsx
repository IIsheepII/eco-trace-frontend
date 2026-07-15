import { Chip } from '@mui/material';
import type { DocumentStatus, ValidationStatus } from '../types/domain';

const statusMap: Record<DocumentStatus | ValidationStatus, { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' }> = {
  UPLOADED: { label: 'Subido', color: 'default' },
  OCR_PENDING: { label: 'OCR pendiente', color: 'primary' },
  OCR_COMPLETED: { label: 'OCR completado', color: 'success' },
  OCR_FAILED: { label: 'OCR fallido', color: 'error' },
  EXTRACTION_PENDING: { label: 'Extracción pendiente', color: 'primary' },
  EXTRACTION_COMPLETED: { label: 'Extracción completada', color: 'success' },
  VALIDATION_PENDING: { label: 'Requiere validación', color: 'warning' },
  VALIDATED: { label: 'Validado', color: 'success' },
  REJECTED: { label: 'Rechazado', color: 'error' },
  QUEUED: { label: 'En cola', color: 'default' },
  RUNNING: { label: 'En ejecución', color: 'primary' },
  COMPLETED: { label: 'Completado', color: 'success' },
  FAILED: { label: 'Fallido', color: 'error' },
  PENDING: { label: 'Pendiente', color: 'default' },
  APPROVED: { label: 'Aprobado', color: 'success' },
  CORRECTED: { label: 'Corregido', color: 'warning' },
};

export function StatusChip({ status }: { status: DocumentStatus | ValidationStatus }) {
  const config = statusMap[status];
  return <Chip size="small" label={config.label} color={config.color} sx={{ borderRadius: 999 }} />;
}
