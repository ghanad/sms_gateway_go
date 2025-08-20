import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Modal, Box, TextField } from '@mui/material';
import apiService from '../../services/apiService.js';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  p: 4
};

const ClientManagementPage = () => {
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [quota, setQuota] = useState('');
  const [editingClient, setEditingClient] = useState(null);

  const fetchClients = async () => {
    const data = await apiService.getClients();
    setClients(data);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreate = async () => {
    if (editingClient) {
      await apiService.updateClient(editingClient.id, { name, daily_quota: quota });
    } else {
      await apiService.createClient({ name, daily_quota: quota });
    }
    setOpen(false);
    setName('');
    setQuota('');
    setEditingClient(null);
    fetchClients();
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'api_key', headerName: 'API Key', flex: 1 },
    { field: 'daily_quota', headerName: 'Daily Quota', flex: 1 },
    { field: 'is_active', headerName: 'Active', flex: 1 }
  ];

  return (
    <div style={{ height: 500, width: '100%' }}>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>
        Create New Client
      </Button>
      <DataGrid
        rows={clients}
        columns={columns}
        getRowId={(row) => row.id}
        onRowDoubleClick={(params) => {
          setEditingClient(params.row);
          setName(params.row.name);
          setQuota(params.row.daily_quota);
          setOpen(true);
        }}
      />
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={style}>
          <TextField label="Name" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Daily Quota" fullWidth margin="normal" value={quota} onChange={(e) => setQuota(e.target.value)} />
          <Button variant="contained" onClick={handleCreate}>Save</Button>
        </Box>
      </Modal>
    </div>
  );
};

export default ClientManagementPage;
