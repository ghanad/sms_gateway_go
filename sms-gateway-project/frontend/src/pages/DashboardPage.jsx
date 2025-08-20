import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import apiService from '../services/apiService.js';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Grid container spacing={2}>
      {stats && Object.entries(stats).map(([key, value]) => (
        <Grid item xs={12} md={4} key={key}>
          <Card>
            <CardContent>
              <Typography variant="h6">{key}</Typography>
              <Typography variant="h4">{value}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardPage;
