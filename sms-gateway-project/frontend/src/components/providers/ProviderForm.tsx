import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { providerCreateSchema, providerUpdateSchema, ProviderBase } from '../../lib/validation/provider';
import JsonEditor from '../../lib/ui/JsonEditor';

interface ProviderFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: (ProviderBase & { id?: string });
  onSuccess: () => void;
}

const ProviderForm: React.FC<ProviderFormProps> = ({ open, onClose, initialData, onSuccess }) => {
  const isEdit = !!initialData?.id;
  const [changePassword, setChangePassword] = useState(false);

  const schema = isEdit ? providerUpdateSchema : providerCreateSchema;

  const { control, handleSubmit, watch, setValue, formState: { errors, isDirty } } = useForm<ProviderBase>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      type: 'magfa',
      is_enabled: true,
      base_url: 'https://sms.magfa.com',
      endpoint_path: '/api/http/sms/v2/send',
      auth_type: 'basic',
      timeout_ms: 10000,
      retries: 2,
      retry_backoff_ms: 500,
      extra_headers_json: { 'Cache-Control': 'no-cache', 'Accept': 'application/json' }
    }
  });

  const onSubmit = async (data: ProviderBase) => {
    const body: Record<string, unknown> = { ...data };
    if (isEdit && !changePassword) {
      delete body.basic_password;
    }
    await onSuccess(body);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Edit Provider' : 'New Provider'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="space-y-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
            )}
          />
          <FormControl fullWidth>
            <InputLabel id="type-label">Type</InputLabel>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="type-label" label="Type">
                  <MenuItem value="magfa">Magfa</MenuItem>
                </Select>
              )}
            />
          </FormControl>
          <FormControlLabel
            control={<Controller name="is_enabled" control={control} render={({ field }) => (
              <Switch {...field} checked={field.value} />
            )} />}
            label="Enabled"
          />
          <Controller
            name="base_url"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Base URL" fullWidth error={!!errors.base_url} helperText={errors.base_url?.message} />
            )}
          />
          <Controller
            name="endpoint_path"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Endpoint Path" fullWidth error={!!errors.endpoint_path} helperText={errors.endpoint_path?.message} />
            )}
          />
          <FormControl fullWidth>
            <InputLabel id="auth-label">Auth Type</InputLabel>
            <Controller
              name="auth_type"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="auth-label" label="Auth Type">
                  <MenuItem value="basic">Basic</MenuItem>
                  <MenuItem value="apikey">API Key</MenuItem>
                  <MenuItem value="bearer">Bearer</MenuItem>
                  <MenuItem value="none">None</MenuItem>
                </Select>
              )}
            />
          </FormControl>
          {watch('auth_type') === 'basic' && (
            <>
              <Controller
                name="basic_username"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Basic Username" fullWidth error={!!errors.basic_username} helperText={errors.basic_username?.message} />
                )}
              />
              {isEdit && !changePassword ? (
                <Button onClick={() => { setChangePassword(true); setValue('basic_password',''); }}>Change password</Button>
              ) : (
                <Controller
                  name="basic_password"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} type="password" label="Basic Password" fullWidth error={!!errors.basic_password} helperText={errors.basic_password?.message || (isEdit ? 'Leave empty to keep current password' : '')} />
                  )}
                />
              )}
            </>
          )}
          <Controller
            name="default_sender"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Default Sender" fullWidth error={!!errors.default_sender} helperText={errors.default_sender?.message} />
            )}
          />
          <Controller
            name="timeout_ms"
            control={control}
            render={({ field }) => (
              <TextField {...field} type="number" label="Timeout (ms)" fullWidth error={!!errors.timeout_ms} helperText={errors.timeout_ms?.message} />
            )}
          />
          <Controller
            name="retries"
            control={control}
            render={({ field }) => (
              <TextField {...field} type="number" label="Retries" fullWidth error={!!errors.retries} helperText={errors.retries?.message} />
            )}
          />
          <Controller
            name="retry_backoff_ms"
            control={control}
            render={({ field }) => (
              <TextField {...field} type="number" label="Retry Backoff (ms)" fullWidth error={!!errors.retry_backoff_ms} helperText={errors.retry_backoff_ms?.message} />
            )}
          />
          <Controller
            name="extra_headers_json"
            control={control}
            render={({ field }) => (
              <JsonEditor value={JSON.stringify(field.value, null, 2)} onChange={(val) => {
                try {
                  const parsed = JSON.parse(val);
                  field.onChange(parsed);
                } catch {
                  field.onChange(field.value);
                }
              }} />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!isDirty}>Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProviderForm;
