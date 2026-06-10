import { describe, expect, it } from 'vitest';
import { API_BASE_URL, httpClient } from './apiClient';

describe('apiClient', () => {
  it('uses the versioned backend base URL and sends credentials', () => {
    expect(API_BASE_URL).toContain('/api/v1');
    expect(httpClient.defaults.withCredentials).toBe(true);
  });
});
