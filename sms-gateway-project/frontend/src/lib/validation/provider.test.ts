import { describe, it, expect } from 'vitest';
import { providerCreateSchema } from './provider';

describe('providerCreateSchema', () => {
  it('accepts valid magfa provider', () => {
    const result = providerCreateSchema.safeParse({
      name: 'magfa-test',
      type: 'magfa',
      is_enabled: true,
      base_url: 'https://sms.magfa.com',
      endpoint_path: '/api/http/sms/v2/send',
      auth_type: 'basic',
      basic_username: 'user/domain',
      basic_password: 'secret',
      priority: 100,
      timeout_ms: 10000,
      retries: 2,
      retry_backoff_ms: 500,
      extra_headers_json: {}
    });
    expect(result.success).toBe(true);
  });

  it('fails for invalid username', () => {
    const result = providerCreateSchema.safeParse({
      name: 'bad',
      type: 'magfa',
      is_enabled: true,
      base_url: 'https://sms.magfa.com',
      endpoint_path: '/api/http/sms/v2/send',
      auth_type: 'basic',
      basic_username: 'invalid',
      basic_password: 'secret',
      priority: 100,
      timeout_ms: 10000,
      retries: 2,
      retry_backoff_ms: 500,
      extra_headers_json: {}
    });
    expect(result.success).toBe(false);
  });
});
