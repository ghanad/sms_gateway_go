import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import apiClient from '../../lib/api/client';
import useAdminGuard from '../../lib/hooks/useAdminGuard';

const ProviderAuditPage = () => {
  const guard = useAdminGuard();
  if (guard) return guard;

  const { id } = useParams();
  const { data } = useQuery(['provider.audit', id], async () => {
    const { data } = await apiClient.GET('/admin/providers/{id}/audit', { params: { path: { id } } });
    return data || [];
  });

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>Audit Log</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>Actor</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Diff</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(data || []).map((entry, idx) => (
            <TableRow key={idx}>
              <TableCell>{entry.time}</TableCell>
              <TableCell>{entry.actor}</TableCell>
              <TableCell>{entry.action}</TableCell>
              <TableCell><pre className="whitespace-pre-wrap">{JSON.stringify(entry.diff, null, 2)}</pre></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ProviderAuditPage;
