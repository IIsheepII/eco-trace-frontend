# AVKA Frontend and NestJS Integration Guide

This document defines the shared contract for connecting the React frontend to the NestJS backend for the intelligent document management platform.

## Integration Flow

1. User submits credentials from `POST /auth/login`.
2. NestJS validates credentials and sets an HttpOnly session cookie.
3. React calls `GET /auth/me` through Axios with `withCredentials: true`.
4. User uploads PDF/image files with `POST /documents/upload`.
5. Backend stores the original file and returns created document records.
6. Backend creates an OCR/AI processing job.
7. Frontend polls `GET /documents/:id` while status is `processing`.
8. Backend completes OCR/AI extraction and returns extracted fields.
9. Frontend renders the original document beside extracted fields.
10. User edits values and marks fields `approved`, `rejected`, or `uncertain`.
11. Frontend saves corrections with `PUT /documents/:id/validation`.
12. User searches documents with `GET /documents`.
13. User exports reports with `POST /reports/export`.
14. Dashboard refreshes `GET /dashboard/metrics` and `GET /dashboard/activity`.

## API Contract Table

| Flow | Method | Endpoint | Request | Success Response | Frontend Consumer |
| --- | --- | --- | --- | --- | --- |
| Login | `POST` | `/auth/login` | `LoginDto` | `UserDto`; sets HttpOnly cookie | `authService.login` |
| Current user | `GET` | `/auth/me` | Cookie session | `UserDto` | `AuthProvider` |
| Logout | `POST` | `/auth/logout` | Cookie session | `204 No Content` | `authService.logout` |
| Dashboard metrics | `GET` | `/dashboard/metrics` | Cookie session | `DashboardMetricsDto` | `DashboardPage` |
| Dashboard activity | `GET` | `/dashboard/activity` | Cookie session | `DocumentDto[]` | `DashboardPage` |
| Search documents | `GET` | `/documents?query=&status=&documentType=&organisationId=` | Query params | `PagedResult<DocumentDto>` | `DocumentsPage` |
| Document detail/status | `GET` | `/documents/:id` | Path id | `DocumentDto` | detail, processing, validation |
| Upload document | `POST` | `/documents/upload` | `multipart/form-data` | `DocumentDto[]` | `UploadDocumentPage` |
| Save validation | `PUT` | `/documents/:id/validation` | `FieldValidationDto` | `ExtractedFieldDto[]` | `ValidateDocumentPage` |
| Processing history | `GET` | `/documents/processing-history` | Cookie session | `PagedResult<DocumentDto>` | `ProcessingHistoryPage` |
| Export report | `POST` | `/reports/export` | `ReportRequestDto` | Blob file | `ReportsPage` |
| Users | `GET` | `/users` | Cookie session | `PagedResult<UserDto>` | `UsersPage` |
| Organisations | `GET` | `/organisations` | Cookie session | `PagedResult<OrganisationDto>` | `OrganisationsPage` |
| Document types | `GET` | `/document-types` | Cookie session | `PagedResult<DocumentTypeDto>` | `DocumentTypesPage` |
| Audit log | `GET` | `/audit-log` | Cookie session | `PagedResult<AuditEventDto>` | `AuditLogPage` |

## Endpoint List

Auth:
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

Documents:
- `GET /documents`
- `GET /documents/:id`
- `POST /documents/upload`
- `PUT /documents/:id/validation`
- `GET /documents/processing-history`

Dashboard and reports:
- `GET /dashboard/metrics`
- `GET /dashboard/activity`
- `POST /reports/export`

Administration:
- `GET /users`
- `GET /organisations`
- `GET /document-types`
- `GET /audit-log`

## DTO List

```ts
type UserRole = 'admin' | 'auditor' | 'validator' | 'viewer';

type LoginDto = {
  email: string;
  password: string;
};

type UserDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organisationId?: string;
};

type DocumentStatus =
  | 'uploaded'
  | 'processing'
  | 'needs_validation'
  | 'validated'
  | 'rejected'
  | 'failed';

type ExtractedFieldStatus = 'approved' | 'rejected' | 'uncertain' | 'pending';

type ExtractedFieldDto = {
  id: string;
  label: string;
  key: string;
  aiValue: string;
  humanValue?: string;
  confidence: number;
  status: ExtractedFieldStatus;
};

type DocumentDto = {
  id: string;
  name: string;
  type: string;
  organisation: string;
  status: DocumentStatus;
  uploadedAt: string;
  processedAt?: string;
  confidence?: number;
  fileUrl?: string;
  fields?: ExtractedFieldDto[];
};

type FieldValidationDto = {
  fields: Array<{
    id: string;
    humanValue?: string;
    status: ExtractedFieldStatus;
  }>;
};

type DashboardMetricsDto = {
  totalDocuments: number;
  pendingValidation: number;
  accuracyRate: number;
  processingQueue: number;
};

type ReportRequestDto = {
  organisationId?: string;
  documentType?: string;
  from: string;
  to: string;
  format: 'csv' | 'json' | 'pdf';
};

type PagedResult<T> = {
  data: T[];
  total: number;
};
```

The frontend definitions live in `src/types/domain.ts` and validation schemas live in `src/schemas`.

## Role and Permission Matrix

| Capability | Admin | Auditor | Validator | Viewer |
| --- | --- | --- | --- | --- |
| Login and profile | Yes | Yes | Yes | Yes |
| Dashboard | Yes | Yes | Yes | Yes |
| View/search documents | Yes | Yes | Yes | Yes |
| Upload documents | Yes | Yes | Yes | No |
| View processing status | Yes | Yes | Yes | Yes |
| Validate fields | Yes | Yes | Yes | No |
| Generate reports | Yes | Yes | No | No |
| View audit log | Yes | Yes | No | No |
| Manage users/roles | Yes | No | No | No |
| Manage organisations | Yes | No | No | No |
| Configure document types/fields | Yes | No | No | No |
| Settings | Yes | Yes | Yes | Yes |

## Environment Variables

Frontend:

```bash
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_ORIGIN=http://localhost:5174
```

Backend:

```bash
FRONTEND_ORIGIN=http://localhost:5174
SESSION_COOKIE_NAME=avka.sid
SESSION_COOKIE_HTTP_ONLY=true
SESSION_COOKIE_SAME_SITE=lax
SESSION_COOKIE_SECURE=false
```

For production, set `SESSION_COOKIE_SECURE=true` and use HTTPS for both app and API.

## Axios and TanStack Query

The frontend uses `src/services/apiClient.ts`:

- `baseURL` comes from `VITE_API_BASE_URL`.
- `withCredentials: true` is enabled globally.
- Multipart uploads pass `FormData` without forcing a JSON content type.
- Report export requests use `responseType: 'blob'`.
- Non-2xx responses are normalized into `ApiError`.

TanStack Query is configured in `src/providers/AppProviders.tsx` with conservative retry behavior and shared query cache.

## CORS Requirements

NestJS must enable credentials and an explicit origin:

```ts
app.enableCors({
  origin: process.env.FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

Do not use `origin: '*'` with cookies. Browsers will reject credentialed cross-origin responses when wildcard origins are used.

## Local Setup Using PNPM

1. Install frontend dependencies:

```bash
pnpm install
```

2. Create local frontend env:

```bash
cp .env.example .env.local
```

3. Start the NestJS API on `http://localhost:3000`.

4. Start the frontend:

```bash
pnpm dev
```

5. Open `http://localhost:5174`.

## Development Workflow

1. Update DTOs in the backend and `src/types/domain.ts` together.
2. Add or update Zod schemas in `src/schemas` for request payloads.
3. Add service methods in `src/services`.
4. Use TanStack Query for reads and mutations.
5. Add consistent loading, empty and error states with `StateView`.
6. Cover new behavior with RTL tests.
7. Extend `e2e/app.spec.ts` for workflow-level coverage.
8. Run:

```bash
pnpm build
pnpm test
pnpm test:e2e
```

## Test Plan

Unit and integration:
- Login form validates email/password and posts through the credentialed Axios client.
- Protected routes block unauthenticated users.
- Role-gated routes redirect unsupported roles to `/403`.
- Document table renders search results and empty states.
- Upload form rejects unsupported file types.
- Validation form saves corrected fields and statuses.
- Report export requests a blob and starts a download.

E2E:
- User logs in and receives HttpOnly cookie from backend.
- `/auth/me` returns profile and private shell renders.
- User uploads a PDF or image.
- Processing status moves from `processing` to `needs_validation`.
- Extracted fields render next to original document preview.
- User edits values and saves validation.
- User searches for the validated document.
- User generates and downloads a report.
- Dashboard metrics reflect the new processed/validated document.

Backend integration tests:
- Session cookie attributes are correct.
- CORS accepts the frontend origin with credentials.
- Upload endpoint creates storage object and processing job.
- OCR/AI worker writes extracted fields.
- Validation endpoint stores human values and audit entries.
- Report endpoint streams CSV/JSON/PDF with correct content type.

## Acceptance Criteria

- Frontend reads `VITE_API_BASE_URL` and consumes real NestJS endpoints.
- Axios sends cookies on every API request.
- Backend sets HttpOnly session cookies on login.
- `/auth/me` protects private routes.
- No final frontend mock data is used for app logic.
- Upload, processing, validation, search, reports and dashboard metrics work end-to-end.
- Empty, loading and error states are present for core screens.
- Main workflows are covered by RTL and Playwright tests.
- Backend CORS is explicit and credential-safe.

## Deployment Recommendations

- Serve frontend and API over HTTPS.
- Prefer same-site deployment, such as `app.example.com` and `api.example.com`, with cookie domain `.example.com` if needed.
- Use `SameSite=Lax` for standard app navigation; use `SameSite=None; Secure` only for truly cross-site embedding.
- Put uploaded originals in durable object storage and serve previews through signed URLs or authenticated proxy endpoints.
- Use short-lived signed report URLs or direct streaming with authorization checks.
- Add Sentry or OpenTelemetry browser tracing for failed API calls.
- Add CDN caching for static assets, but never cache authenticated API responses publicly.

## Future Scalability Recommendations

- Generate frontend DTOs from OpenAPI to prevent contract drift.
- Add WebSocket or SSE updates for processing status instead of polling.
- Split large route bundles with lazy imports.
- Add optimistic dashboard invalidation after validation/report operations.
- Move document previews to a dedicated viewer worker for large PDFs.
- Add cursor pagination for documents, audit logs and processing history.
- Add feature flags for OCR provider and AI extraction model upgrades.
- Version extraction templates so historical validations remain reproducible.
