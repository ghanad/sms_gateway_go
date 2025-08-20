import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import apiService from '../services/apiService.js';

const MessageDetailPage = () => {
  const { trackingId } = useParams();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const data = await apiService.getMessageDetails(trackingId);
        setMessage(data);
      } catch (err) {
        setError('Failed to load message');
      } finally {
        setLoading(false);
      }
    };
    fetchMessage();
  }, [trackingId]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Recipient: {message.recipient}</Typography>
          <Typography>Status: {message.status}</Typography>
          <Typography>Text: {message.text}</Typography>
        </CardContent>
      </Card>
      <Timeline>
        {message.events?.map((event, index) => (
          <TimelineItem key={index}>
            <TimelineSeparator>
              <TimelineDot />
              {index < message.events.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography>{event.status}</Typography>
              <Typography variant="caption">{event.timestamp}</Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
};

export default MessageDetailPage;
