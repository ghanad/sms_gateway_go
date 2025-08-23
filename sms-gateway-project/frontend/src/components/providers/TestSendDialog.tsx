import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

interface TestSendDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { sender: string; message: string; recipients: string[]; dryRun: boolean }) => Promise<void>;
}

const TestSendDialog: React.FC<TestSendDialogProps> = ({ open, onClose, onSubmit }) => {
  const { control, handleSubmit } = useForm<{ sender: string; message: string; recipients: string; dryRun: boolean }>({
    defaultValues: { dryRun: true }
  });

  const submit = async (data: { sender: string; message: string; recipients: string; dryRun: boolean }) => {
    const recipients = data.recipients.split(/\n|,/).map(r => r.trim()).filter(Boolean);
    await onSubmit({ ...data, recipients });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Test Send</DialogTitle>
      <form onSubmit={handleSubmit(submit)}>
        <DialogContent className="space-y-4">
          <Controller
            name="sender"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Sender" fullWidth />
            )}
          />
          <Controller
            name="message"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Message" fullWidth multiline minRows={3} />
            )}
          />
          <Controller
            name="recipients"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Recipients" fullWidth multiline minRows={2} helperText="One per line or comma-separated" />
            )}
          />
          <Controller
            name="dryRun"
            control={control}
            render={({ field }) => (
              <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label="Dry Run" />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit">Send</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TestSendDialog;
