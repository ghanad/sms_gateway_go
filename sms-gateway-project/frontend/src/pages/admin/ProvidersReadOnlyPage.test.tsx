import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProvidersReadOnlyPage from './ProvidersReadOnlyPage';
import { vi } from 'vitest';

vi.mock('../../lib/api/client', () => ({
  apiClient: {
    GET: vi.fn((path: any) => {
      if (path === '/admin/providers') {
        return Promise.resolve({ data: [{ id: 'magfa', name: 'magfa', type: 'magfa', is_enabled: true, base_url: 'https://sms.magfa.com', hasBalance: true, updatedAt: new Date().toISOString() }] });
      }
      return Promise.resolve({ data: { ok: true, balance: 5, raw: { balance: 5 } } });
    })
  }
}));

function renderPage() {
  const client = new QueryClient();
  render(<QueryClientProvider client={client}><ProvidersReadOnlyPage /></QueryClientProvider>);
}

test('renders list and balance modal', async () => {
  renderPage();
  const cells = await screen.findAllByText('magfa');
  expect(cells.length).toBeGreaterThan(0);
  const btn = await screen.findByRole('button', { name: /check balance/i });
  btn.click();
  await waitFor(() => expect(screen.getByText('Balance: 5')).toBeInTheDocument());
});
