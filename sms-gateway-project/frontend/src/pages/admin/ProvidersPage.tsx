import React, { useState } from 'react';
import { Button, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HistoryIcon from '@mui/icons-material/History';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/api/client';
import ProviderForm from '../../components/providers/ProviderForm';
import TestSendDialog from '../../components/providers/TestSendDialog';
import useAdminGuard from '../../lib/hooks/useAdminGuard';

const ProvidersPage = () => {
  const guard = useAdminGuard();
  if (guard) return guard;

  const queryClient = useQueryClient();
  const { data } = useQuery(['providers.list'], async () => {
    const { data, error } = await apiClient.GET('/admin/providers');
    if (error) throw error;
    return data || [];
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>();
  const [testProvider, setTestProvider] = useState<any>();

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'type', headerName: 'Type' },
    { field: 'is_enabled', headerName: 'Status', valueGetter: (params) => params.value ? 'Enabled' : 'Disabled' },
    { field: 'base_url', headerName: 'Base URL', flex: 1 },
    { field: 'updated_at', headerName: 'Updated At', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => { setEditing(params.row); setFormOpen(true); }}><EditIcon /></IconButton>
          <IconButton onClick={() => setTestProvider(params.row)}><PlayArrowIcon /></IconButton>
          <IconButton component={Link} to={`/admin/providers/${params.row.id}/audit`}><HistoryIcon /></IconButton>
          <IconButton onClick={async () => { await apiClient.DELETE('/admin/providers/{id}', { params: { path: { id: params.row.id } } }); queryClient.invalidateQueries(['providers.list']); }}><DeleteIcon /></IconButton>
        </>
      )
    }
  ];

  return (
    <>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Providers</h2>
      </div>
      <div className="flex justify-end mb-4">
        <Button variant="contained" onClick={() => { setEditing(undefined); setFormOpen(true); }}>New Provider</Button>
      </div>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid rows={data || []} columns={columns} getRowId={(row) => row.id} />
      </div>
      {formOpen && (
        <ProviderForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          initialData={editing}
          onSuccess={async (body) => {
            if (editing) {
              await apiClient.PATCH('/admin/providers/{id}', { params: { path: { id: editing.id } }, body });
            } else {
              await apiClient.POST('/admin/providers', { body });
            }
            queryClient.invalidateQueries(['providers.list']);
          }}
        />
      )}
      {testProvider && (
        <TestSendDialog
          open={!!testProvider}
          onClose={() => setTestProvider(undefined)}
          onSubmit={async (data) => {
            await apiClient.POST('/admin/providers/{id}/test', { params: { path: { id: testProvider.id } }, body: { sender: data.sender, message: data.message, recipients: data.recipients, dry_run: data.dryRun } });
          }}
        />
      )}
    </>
  );
};

export default ProvidersPage;