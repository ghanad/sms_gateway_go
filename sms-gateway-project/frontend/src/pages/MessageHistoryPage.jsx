import React, { useEffect, useState } from 'react';
import { TextField, Select, MenuItem, Grid, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService.js';

const MessageHistoryPage = () => {
  const [filters, setFilters] = useState({ recipient: '', status: '', startDate: null, endDate: null });
  const [messages, setMessages] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        recipient: filters.recipient || undefined,
        status: filters.status || undefined,
        startDate: filters.startDate ? filters.startDate.toISOString() : undefined,
        endDate: filters.endDate ? filters.endDate.toISOString() : undefined
      };
      const data = await apiService.getMessages(params);
      setMessages(data.items || []);
      setRowCount(data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters, paginationModel]);

  const columns = [
    {
      field: 'tracking_id',
      headerName: 'Tracking ID',
      width: 200,
      renderCell: (params) => <Link to={`/messages/${params.value}`}>{params.value}</Link>
    },
    { field: 'recipient', headerName: 'Recipient', width: 150 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'provider', headerName: 'Provider', width: 150 },
    { field: 'created_at', headerName: 'Created At', width: 200 }
  ];

  return (
    <div style={{ height: 600, width: '100%' }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item>
          <TextField label="Recipient" value={filters.recipient} onChange={(e) => setFilters({ ...filters, recipient: e.target.value })} />
        </Grid>
        <Grid item>
          <Select displayEmpty value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="sent">Sent</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </Select>
        </Grid>
        <Grid item>
          <DatePicker label="Start Date" value={filters.startDate} onChange={(newValue) => setFilters({ ...filters, startDate: newValue })} />
        </Grid>
        <Grid item>
          <DatePicker label="End Date" value={filters.endDate} onChange={(newValue) => setFilters({ ...filters, endDate: newValue })} />
        </Grid>
        <Grid item>
          <Button variant="outlined" onClick={fetchData}>Search</Button>
        </Grid>
      </Grid>
      <DataGrid
        rows={messages}
        columns={columns}
        rowCount={rowCount}
        pageSizeOptions={[10, 25, 50]}
        paginationModel={paginationModel}
        paginationMode="server"
        onPaginationModelChange={setPaginationModel}
        loading={loading}
        getRowId={(row) => row.tracking_id}
      />
    </div>
  );
};

export default MessageHistoryPage;
