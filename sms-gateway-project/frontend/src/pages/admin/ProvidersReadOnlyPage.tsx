import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api/client';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

export default function ProvidersReadOnlyPage() {
  const { data } = useQuery(['providers'], async () => {
    const { data } = await apiClient.GET('/admin/providers');
    return data || [];
  });

  const [balance, setBalance] = useState<any | null>(null);
  const [balanceId, setBalanceId] = useState('');

  const checkBalance = async (id: string) => {
    const { data } = await apiClient.GET('/admin/providers/{id}/balance', { params: { path: { id } } });
    setBalance(data);
    setBalanceId(id);
  };

  return (
    <div>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-2">Name</th>
            <th className="border px-2">Type</th>
            <th className="border px-2">Status</th>
            <th className="border px-2">Base URL</th>
            <th className="border px-2">Updated At</th>
            <th className="border px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.map(p => (
            <tr key={p.id}>
              <td className="border px-2">{p.name}</td>
              <td className="border px-2">{p.type}</td>
              <td className="border px-2">{p.is_enabled ? 'enabled' : 'disabled'}</td>
              <td className="border px-2">{p.base_url}</td>
              <td className="border px-2">{new Date(p.updatedAt).toLocaleString()}</td>
              <td className="border px-2">{p.hasBalance && <Button onClick={() => checkBalance(p.id)}>Check Balance</Button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Dialog open={!!balance} onClose={() => setBalance(null)}>
        <DialogTitle>Balance for {balanceId}</DialogTitle>
        <DialogContent>
          {balance && (
            <div>
              <p>Status: {balance.ok ? 'ok' : balance.error}</p>
              {balance.balance !== undefined && <p>Balance: {balance.balance} {balance.unit || ''}</p>}
              {balance.raw && (
                <details>
                  <summary>raw</summary>
                  <pre>{JSON.stringify(balance.raw, null, 2)}</pre>
                </details>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBalance(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
