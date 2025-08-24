import React from 'react';
import { render, screen } from '@testing-library/react';
import ProviderForm from './ProviderForm';
import { vi } from 'vitest';

const baseProvider = {
  name: 'existing',
  type: 'magfa',
  is_enabled: true,
  base_url: 'https://sms.magfa.com',
  endpoint_path: '/api/http/sms/v2/send',
  auth_type: 'basic',
  basic_username: 'user/domain',
  basic_password: 'secret',
  priority: 55,
  timeout_ms: 10000,
  retries: 2,
  retry_backoff_ms: 500,
  extra_headers_json: {}
};

test('prefills form when editing', () => {
  render(<ProviderForm open={true} onClose={() => {}} onSuccess={vi.fn()} initialData={baseProvider} />);
  expect(screen.getByDisplayValue('existing')).toBeInTheDocument();
  expect(screen.getByDisplayValue('user/domain')).toBeInTheDocument();
  expect(screen.getByDisplayValue('55')).toBeInTheDocument();
});
