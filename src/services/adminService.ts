import type { AdminUser, AuditEvent, DocumentType, Organisation } from '../types/domain';
import { apiRequest } from './apiClient';

export const adminService = {
  users: () => apiRequest<AdminUser[]>('/users'),
  organisations: () => apiRequest<Organisation[]>('/organisations'),
  documentTypes: () => apiRequest<DocumentType[]>('/document-types'),
  auditLog: () =>
    apiRequest<Array<AuditEvent & { userId?: string | null; resource: string; resourceId?: string | null }>>('/audit').then((events) =>
      events.map((event) => ({
        ...event,
        actor: event.actor ?? event.userId ?? 'System',
        target: event.resourceId ? `${event.resource}:${event.resourceId}` : event.resource,
      })),
    ),
};
