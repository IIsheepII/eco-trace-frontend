import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AccessDeniedPage } from './AccessDeniedPage';
import { DocumentTypesPage, OrganisationsPage, UsersPage } from '../features/admin/AdminTables';
import { AuditLogPage } from '../features/audit/AuditLogPage';
import { LoginPage } from '../features/auth/LoginPage';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { DocumentDetailPage } from '../features/documents/DocumentDetailPage';
import { DocumentsPage } from '../features/documents/DocumentsPage';
import { ProcessingHistoryPage } from '../features/documents/ProcessingHistoryPage';
import { ProcessingStatusPage } from '../features/documents/ProcessingStatusPage';
import { UploadDocumentPage } from '../features/documents/UploadDocumentPage';
import { ValidateDocumentPage } from '../features/documents/ValidateDocumentPage';
import { ReportsPage } from '../features/reports/ReportsPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { AppLayout } from '../layouts/AppLayout';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/403" element={<AccessDeniedPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route element={<ProtectedRoute permissions={['documents:manage']} />}>
              <Route path="documents/upload" element={<UploadDocumentPage />} />
            </Route>
            <Route path="documents/:id" element={<DocumentDetailPage />} />
            <Route path="documents/:id/processing" element={<ProcessingStatusPage />} />
            <Route element={<ProtectedRoute permissions={['documents:validate']} />}>
              <Route path="documents/:id/validate" element={<ValidateDocumentPage />} />
            </Route>
            <Route path="processing-history" element={<ProcessingHistoryPage />} />
            <Route element={<ProtectedRoute permissions={['reports:read']} />}>
              <Route path="reports" element={<ReportsPage />} />
            </Route>
            <Route element={<ProtectedRoute permissions={['settings:manage']} />}>
              <Route path="audit-log" element={<AuditLogPage />} />
            </Route>
            <Route element={<ProtectedRoute permissions={['users:manage']} />}>
              <Route path="users" element={<UsersPage />} />
            </Route>
            <Route element={<ProtectedRoute permissions={['organisations:manage']} />}>
              <Route path="organisations" element={<OrganisationsPage />} />
            </Route>
            <Route element={<ProtectedRoute permissions={['documents:manage']} />}>
              <Route path="document-types" element={<DocumentTypesPage />} />
            </Route>
            <Route element={<ProtectedRoute permissions={['settings:manage']} />}>
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
