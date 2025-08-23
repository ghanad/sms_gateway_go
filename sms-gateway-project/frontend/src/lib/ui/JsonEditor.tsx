import React, { useState } from 'react';
import { TextField } from '@mui/material';

interface JsonEditorProps {
  value: string;
  onChange: (val: string) => void;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange }) => {
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    try {
      const parsed = JSON.parse(val);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        setError('');
      } else {
        setError('Must be an object');
      }
    } catch {
      setError('Invalid JSON');
    }
  };

  return (
    <TextField
      label="Extra Headers"
      multiline
      minRows={4}
      fullWidth
      value={value}
      onChange={handleChange}
      error={!!error}
      helperText={error || 'JSON object of string to string'}
    />
  );
};

export default JsonEditor;
