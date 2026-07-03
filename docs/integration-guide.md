# Frontend Integration Guide

This guide documents the current React integration with the NestJS API.

## Local URLs

| Service | URL |
|---|---|
| Frontend | `http://localhost:5174` |
| Backend API | `http://localhost:3000/api/v1` |
| Backend Swagger | `http://localhost:3000/docs` |

Use `localhost` consistently. Do not mix `localhost` and `127.0.0.1` because the app relies on HttpOnly cookies.

## Environment

Frontend `.env`:

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_ORIGIN=http://localhost:5174
```

Backend `.env` must include the frontend origin:

```bash
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
COOKIE_DOMAIN=
```

## Auth Flow

1. `POST /auth/login` validates credentials.
2. Backend sets `access_token` and `refresh_token` HttpOnly cookies.
3. Frontend calls `POST /auth/refresh` to load the authenticated profile.
4. All protected requests use Axios with `withCredentials: true`.
5. `POST /auth/logout` clears cookies server-side.

Frontend consumers:

- `src/services/apiClient.ts`
- `src/services/authService.ts`
- `src/features/auth/AuthProvider.tsx`

## Document Processing Flow

1. Upload original file with `POST /documents/upload`.
2. Backend stores file and creates an OCR processing job.
3. Frontend starts OCR with `POST /documents/:id/ocr/process`.
4. Backend stores `OcrResult`.
5. Frontend starts AI extraction with `POST /ai-extraction/documents/:documentId/run`.
6. Frontend reads status with `GET /documents/:id/processing-status`.
7. Frontend reads OCR text with `GET /documents/:id/ocr-result`.
8. User validates fields with `POST /validation/documents/:documentId`.
9. Search uses `GET /documents`.
10. Reports use `GET /reports` and `POST /reports`.
11. Dashboard metrics use `GET /metrics`.

## Endpoint Map

| Flow | Method | Endpoint | Frontend consumer |
|---|---|---|---|
| Login | POST | `/auth/login` | `authService.login` |
| Profile refresh | POST | `/auth/refresh` | `authService.me` |
| Logout | POST | `/auth/logout` | `authService.logout` |
| Upload | POST | `/documents/upload` | `documentService.upload` |
| List/search | GET | `/documents` | `documentService.list` |
| Detail | GET | `/documents/:id` | `documentService.get` |
| Preview file | GET | `/documents/:id/file` | `documentService.getFileBlob` |
| OCR process | POST | `/documents/:id/ocr/process` | `documentService.processOcr` |
| OCR result | GET | `/documents/:id/ocr-result` | `documentService.getOcrResult` |
| Processing status | GET | `/documents/:id/processing-status` | `documentService.getProcessingStatus` |
| AI extraction | POST | `/ai-extraction/documents/:documentId/run` | `documentService.runAiExtraction` |
| Validation | POST | `/validation/documents/:documentId` | `documentService.validate` |
| Metrics | GET | `/metrics` | `dashboardService.metrics` |
| Reports | GET/POST | `/reports` | `reportService` |

## Testing

Use Corepack so the project uses the pinned PNPM version:

```bash
corepack pnpm build
corepack pnpm test
```

For Playwright in Windows, the most stable mode is to run Vite separately and set `PLAYWRIGHT_USE_EXISTING_SERVER=true`:

```powershell
corepack pnpm dev
```

In another terminal:

```powershell
$env:PLAYWRIGHT_USE_EXISTING_SERVER='true'
.\node_modules\.bin\playwright.cmd test
```

Covered E2E scenarios:

- Login with HttpOnly-cookie backend session contract.
- Upload, OCR, AI extraction, validation, search, reports and dashboard.
- OCR failure state blocks validation and shows a sanitized error.

## Development Workflow

1. Treat backend controllers/DTOs as the source of truth.
2. Update `src/types/domain.ts` when backend response shapes change.
3. Update service methods in `src/services`.
4. Use TanStack Query for reads/mutations.
5. Keep loading, empty and error states explicit.
6. Update Playwright mocks when backend contract changes.
7. Run frontend build/tests and backend build/tests before handoff.

## Current Limitations

- OCR/AI processing is still synchronous over HTTP.
- Reports currently validate the API record flow; richer file export should be completed separately.
- E2E uses contract mocks, not a full backend test environment.
