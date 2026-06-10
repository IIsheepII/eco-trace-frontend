import { afterEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from './apiClient';
import { reportService } from './reportService';

afterEach(() => vi.restoreAllMocks());

describe('reportService', () => {
  it('creates reports through the backend reports endpoint', async () => {
    const report = { id: 'report-1', title: 'Monthly PDF', format: 'PDF', durationMs: 12, createdAt: '2026-06-09T10:00:00Z' };
    const request = vi.spyOn(httpClient, 'request').mockResolvedValue({ data: report });

    await expect(reportService.create({ title: 'Monthly PDF', format: 'PDF', documentId: '' })).resolves.toEqual(report);
    expect(request).toHaveBeenCalledWith(expect.objectContaining({
      url: '/reports',
      method: 'POST',
      data: JSON.stringify({ title: 'Monthly PDF', format: 'PDF' }),
    }));
  });
});
