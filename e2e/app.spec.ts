import { expect, test } from '@playwright/test';

const user = {
  id: 'u1',
  email: 'alex@avka.test',
  organisationId: 'org-1',
  role: 'admin',
  permissions: ['documents:manage', 'documents:validate', 'reports:read', 'settings:manage'],
};

const documentType = {
  id: 'dt-1',
  name: 'Invoice',
  code: 'INVOICE',
  isActive: true,
  fieldDefinitions: [
    {
      id: 'field-1',
      documentTypeId: 'dt-1',
      name: 'invoice_number',
      label: 'Invoice Number',
      dataType: 'string',
      required: true,
      order: 1,
    },
  ],
};

const backendDocument = {
  id: 'doc-1',
  title: 'EPA-Form-8700-22.pdf',
  status: 'VALIDATION_PENDING',
  metadata: {},
  createdAt: '2026-06-09T10:00:00Z',
  updatedAt: '2026-06-09T10:00:00Z',
  documentType,
  uploadedFile: {
    id: 'file-1',
    originalName: 'EPA-Form-8700-22.pdf',
    storageKey: 'uploads/file.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 32,
    checksum: 'abc',
    createdAt: '2026-06-09T10:00:00Z',
  },
  extractedFields: [
    {
      id: 'extracted-1',
      fieldDefinitionId: 'field-1',
      fieldDefinition: documentType.fieldDefinitions[0],
      aiValue: 'EPA-123',
      confidence: '0.9600',
      source: 'ai-placeholder',
      rawPayload: {},
      createdAt: '2026-06-09T10:00:00Z',
    },
  ],
  validatedFields: [],
  processingJobs: [
    {
      id: 'job-1',
      documentId: 'doc-1',
      type: 'AI_EXTRACTION',
      status: 'COMPLETED',
      finishedAt: '2026-06-09T10:01:00Z',
      output: {},
      createdAt: '2026-06-09T10:00:30Z',
    },
  ],
};

const ocrResult = {
  id: 'ocr-result-1',
  documentId: 'doc-1',
  processingJobId: 'ocr-job',
  rawText: 'Invoice Number: EPA-123\nIssue Date: 2026-06-09\nTotal Amount: 120.00',
  language: 'spa+eng',
  confidence: null,
  characterCount: 70,
  processingTimeMs: 1200,
  status: 'COMPLETED',
  errorMessage: null,
  metadata: { engine: 'tesseract-cli' },
  createdAt: '2026-06-09T10:00:10Z',
  updatedAt: '2026-06-09T10:00:10Z',
};

async function routeAuthenticatedApi(page: import('@playwright/test').Page) {
  await page.route('**/api/v1/auth/refresh', async (route) => {
    await route.fulfill({ json: { user } });
  });
  await page.route('**/api/v1/document-types', async (route) => {
    await route.fulfill({ json: [documentType] });
  });
  await page.route('**/api/v1/documents/doc-1', async (route) => {
    await route.fulfill({ json: backendDocument });
  });
  await page.route('**/api/v1/documents/doc-1/file', async (route) => {
    await route.fulfill({
      body: Buffer.from('%PDF-1.4 test manifest'),
      headers: { 'Content-Type': 'application/pdf' },
    });
  });
  await page.route('**/api/v1/documents?**', async (route) => {
    await route.fulfill({ json: [backendDocument] });
  });
  await page.route('**/api/v1/documents', async (route) => {
    await route.fulfill({ json: [backendDocument] });
  });
  await page.route('**/api/v1/documents/upload', async (route) => {
    await route.fulfill({ json: { ...backendDocument, status: 'OCR_PENDING', extractedFields: [] } });
  });
  await page.route('**/api/v1/documents/doc-1/ocr/process', async (route) => {
    await route.fulfill({
      json: {
        job: { id: 'ocr-job', documentId: 'doc-1', type: 'OCR', status: 'COMPLETED', output: {}, createdAt: '2026-06-09T10:00:10Z' },
        ocrResult,
      },
    });
  });
  await page.route('**/api/v1/documents/doc-1/ocr-result', async (route) => {
    await route.fulfill({ json: ocrResult });
  });
  await page.route('**/api/v1/documents/doc-1/processing-status', async (route) => {
    await route.fulfill({
      json: {
        documentId: 'doc-1',
        documentStatus: 'VALIDATION_PENDING',
        latestJob: backendDocument.processingJobs[0],
        ocrJob: { id: 'ocr-job', documentId: 'doc-1', type: 'OCR', status: 'COMPLETED', output: {}, createdAt: '2026-06-09T10:00:10Z' },
        aiExtractionJob: backendDocument.processingJobs[0],
        ocrResult: {
          id: ocrResult.id,
          status: ocrResult.status,
          language: ocrResult.language,
          characterCount: ocrResult.characterCount,
          processingTimeMs: ocrResult.processingTimeMs,
          errorMessage: ocrResult.errorMessage,
        },
      },
    });
  });
  await page.route('**/api/v1/ai-extraction/documents/doc-1/run', async (route) => {
    await route.fulfill({ json: { job: { id: 'ai-job', documentId: 'doc-1', type: 'AI_EXTRACTION', status: 'COMPLETED', output: {}, createdAt: '2026-06-09T10:00:20Z' }, extracted: backendDocument.extractedFields } });
  });
  await page.route('**/api/v1/validation/documents/doc-1', async (route) => {
    await route.fulfill({ json: { id: 'validation-1', fields: [] } });
  });
  await page.route('**/api/v1/reports', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ json: { id: 'report-1', title: 'June Report', format: 'PDF', durationMs: 12, createdAt: '2026-06-09T10:02:00Z' } });
      return;
    }
    await route.fulfill({ json: [] });
  });
  await page.route('**/api/v1/metrics', async (route) => {
    await route.fulfill({ json: [{ id: 'm1', name: 'extraction_accuracy', value: '96.0000' }] });
  });
  await page.route('**/api/v1/settings', async (route) => {
    await route.fulfill({ json: [] });
  });
}

async function routeProcessingFailureApi(page: import('@playwright/test').Page) {
  await routeAuthenticatedApi(page);
  await page.route('**/api/v1/documents/doc-1', async (route) => {
    await route.fulfill({ json: { ...backendDocument, status: 'OCR_FAILED', extractedFields: [] } });
  });
  await page.route('**/api/v1/documents/doc-1/ocr-result', async (route) => {
    await route.fulfill({
      json: {
        ...ocrResult,
        rawText: '',
        characterCount: 0,
        status: 'FAILED',
        errorMessage: 'OCR processing failed. Verify that Tesseract and Poppler are installed and that the file can be processed.',
      },
    });
  });
  await page.route('**/api/v1/documents/doc-1/processing-status', async (route) => {
    await route.fulfill({
      json: {
        documentId: 'doc-1',
        documentStatus: 'OCR_FAILED',
        latestJob: {
          id: 'ocr-job',
          documentId: 'doc-1',
          type: 'OCR',
          status: 'FAILED',
          errorMessage: 'OCR processing failed. Verify that Tesseract and Poppler are installed and that the file can be processed.',
          output: {},
          createdAt: '2026-06-09T10:00:10Z',
        },
        ocrJob: {
          id: 'ocr-job',
          documentId: 'doc-1',
          type: 'OCR',
          status: 'FAILED',
          errorMessage: 'OCR processing failed. Verify that Tesseract and Poppler are installed and that the file can be processed.',
          output: {},
          createdAt: '2026-06-09T10:00:10Z',
        },
        aiExtractionJob: null,
        ocrResult: {
          id: ocrResult.id,
          status: 'FAILED',
          language: ocrResult.language,
          characterCount: 0,
          processingTimeMs: ocrResult.processingTimeMs,
          errorMessage: 'OCR processing failed. Verify that Tesseract and Poppler are installed and that the file can be processed.',
        },
      },
    });
  });
}

test('user logs in with an HttpOnly-cookie backend session contract', async ({ page }) => {
  await page.route('**/api/v1/auth/refresh', async (route) => {
    await route.fulfill({ status: 401, json: { success: false, error: { message: 'Missing refresh token' } } });
  });
  await page.route('**/api/v1/auth/login', async (route) => {
    await expect(route.request().postDataJSON()).toEqual({ email: 'alex@avka.test', password: 'password123' });
    await route.fulfill({
      json: { user },
      headers: {
        'Set-Cookie': 'access_token=test-session; HttpOnly; Path=/; SameSite=Lax',
      },
    });
  });
  await page.route('**/api/v1/documents', async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.route('**/api/v1/metrics', async (route) => {
    await route.fulfill({ json: [] });
  });

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Welcome to AVKA' })).toBeVisible();
  await page.getByLabel(/work email/i).fill('alex@avka.test');
  await page.getByLabel(/password/i).fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page.getByRole('heading', { name: 'System Overview' })).toBeVisible();
});

test('upload, processing, validation, search, reports and dashboard integrate with API contracts', async ({ page }) => {
  await routeAuthenticatedApi(page);

  await page.goto('/documents/upload');
  await page.getByLabel('Title').fill('EPA-Form-8700-22.pdf');
  await page.getByLabel('Document type').click();
  await page.getByRole('option', { name: 'Invoice' }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: 'EPA-Form-8700-22.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 test manifest'),
  });
  await page.getByRole('button', { name: /start ai extraction/i }).click();
  await expect(page.getByRole('heading', { name: 'Extraction Complete' })).toBeVisible();
  await expect(page.getByText('OCR characters')).toBeVisible();
  await expect(page.getByText('Invoice Number: EPA-123')).toBeVisible();

  await page.goto('/documents/doc-1/validate');
  await expect(page.getByRole('heading', { name: 'Validate Manifest' })).toBeVisible();
  await page.getByLabel('Validated value').fill('EPA-123-CORRECTED');
  await page.getByRole('button', { name: /save validated data/i }).click();
  await expect(page.getByRole('heading', { name: 'EPA-Form-8700-22.pdf' })).toBeVisible();

  await page.goto('/documents');
  await page.getByLabel(/search documents/i).fill('EPA-Form');
  await expect(page.getByText('EPA-Form-8700-22.pdf')).toBeVisible();

  await page.goto('/reports');
  await page.getByLabel('Report title').fill('June Report');
  await page.getByRole('button', { name: /generate report/i }).click();
  await expect(page.getByText('Report generated.')).toBeVisible();

  await page.goto('/');
  await expect(page.getByText('96%')).toBeVisible();
});

test('processing status surfaces OCR failures and blocks validation', async ({ page }) => {
  await routeProcessingFailureApi(page);

  await page.goto('/documents/doc-1/processing');

  await expect(page.getByRole('heading', { name: 'Extraction Needs Attention' })).toBeVisible();
  await expect(page.getByText(/OCR processing failed/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /validate fields/i })).toBeDisabled();
});
