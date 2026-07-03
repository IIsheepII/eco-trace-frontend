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
  await page.route('**/api/v1/documents?**', async (route) => {
    await route.fulfill({ json: [backendDocument] });
  });
  await page.route('**/api/v1/documents', async (route) => {
    await route.fulfill({ json: [backendDocument] });
  });
  await page.route('**/api/v1/documents/upload', async (route) => {
    await route.fulfill({ json: { ...backendDocument, status: 'OCR_PENDING', extractedFields: [] } });
  });
  await page.route('**/api/v1/ocr/documents/doc-1/run', async (route) => {
    await route.fulfill({ json: { id: 'ocr-job', documentId: 'doc-1', type: 'OCR', status: 'COMPLETED', output: {}, createdAt: '2026-06-09T10:00:10Z' } });
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
  await expect(page.getByRole('heading', { name: 'AI Extraction in Progress' })).toBeVisible();

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
