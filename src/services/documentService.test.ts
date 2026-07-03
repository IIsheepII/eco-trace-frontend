import { afterEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from './apiClient';
import { documentService } from './documentService';

afterEach(() => vi.restoreAllMocks());

const backendDocument = {
  id: 'doc-1',
  title: 'Invoice.pdf',
  status: 'VALIDATION_PENDING',
  metadata: {},
  createdAt: '2026-06-09T10:00:00Z',
  updatedAt: '2026-06-09T10:00:00Z',
  documentType: {
    id: 'dt-1',
    name: 'Invoice',
    code: 'INVOICE',
    isActive: true,
    fieldDefinitions: [],
  },
  extractedFields: [
    {
      id: 'extracted-1',
      fieldDefinitionId: 'field-1',
      fieldDefinition: {
        id: 'field-1',
        documentTypeId: 'dt-1',
        name: 'invoice_number',
        label: 'Invoice Number',
        dataType: 'string',
        required: true,
        order: 1,
      },
      aiValue: 'INV-001',
      confidence: '0.8200',
      source: 'ai-placeholder',
      rawPayload: {},
      createdAt: '2026-06-09T10:00:00Z',
    },
  ],
  uploadedFile: {
    id: 'file-1',
    originalName: 'Invoice.pdf',
    storageKey: 'invoice.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 128,
    checksum: 'abc',
    createdAt: '2026-06-09T10:00:00Z',
  },
  validatedFields: [],
  processingJobs: [],
};

describe('documentService', () => {
  it('uploads one multipart file to the backend upload contract and maps the preview URL', async () => {
    const request = vi.spyOn(httpClient, 'request').mockResolvedValue({ data: backendDocument });
    const formData = new FormData();
    formData.set('title', 'Invoice.pdf');
    formData.set('documentTypeId', 'dt-1');

    const uploaded = await documentService.upload(formData);
    expect(uploaded).toMatchObject({ id: 'doc-1', name: 'Invoice.pdf', fileUrl: expect.stringContaining('/documents/doc-1/file') });
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ url: '/documents/upload', method: 'POST', data: formData }));
  });

  it('passes only backend-supported search filters', async () => {
    const request = vi.spyOn(httpClient, 'request').mockResolvedValue({ data: [backendDocument] });

    await documentService.list({ q: 'Invoice', fieldName: 'invoice_number' });
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ url: '/documents?q=Invoice&fieldName=invoice_number' }));
  });

  it('saves validated fields through the validation module route', async () => {
    const request = vi.spyOn(httpClient, 'request').mockResolvedValue({ data: { id: 'validation-1' } });

    await documentService.validate('doc-1', {
      fields: [{ fieldDefinitionId: 'field-1', extractedFieldId: 'extracted-1', finalValue: 'INV-001' }],
    });
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ url: '/validation/documents/doc-1', method: 'POST' }));
  });

  it('runs OCR and AI extraction through their real processing endpoints', async () => {
    const request = vi.spyOn(httpClient, 'request').mockResolvedValue({ data: { id: 'job-1' } });

    await documentService.runOcr('doc-1');
    await documentService.runAiExtraction('doc-1');

    expect(request).toHaveBeenCalledWith(expect.objectContaining({ url: '/ocr/documents/doc-1/run', method: 'POST' }));
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ url: '/ai-extraction/documents/doc-1/run', method: 'POST' }));
  });
});
