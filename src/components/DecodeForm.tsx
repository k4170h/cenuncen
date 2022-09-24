import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';
import { DecodeOptions } from '../types';

type Props = {
  isFullsize: boolean;
  needKey: boolean;
  onSubmit: (options: DecodeOptions) => void;
  disabled: boolean;
};

const DecodeForm = ({ onSubmit, disabled, needKey, isFullsize }: Props) => {
  const [isJuggle, setIsJuggle] = useState(false);
  const [hashKey, setHashKey] = useState<string | null>(null);

  return (
    <FormControl style={{ width: '100%' }}>
      <Box display="flex" p={2}>
        <FormControlLabel
          control={<Checkbox defaultChecked />}
          label="補完"
          sx={{ display: 'inline-block' }}
          disabled={disabled}
          onChange={(_, v) => {
            setIsJuggle(v);
          }}
        />
        <TextField
          type="text"
          label="鍵"
          style={{ width: '6em' }}
          size="small"
          disabled={disabled || !needKey}
          onChange={(e) => {
            setHashKey(e.target.value);
          }}
        />
      </Box>
      <Button
        variant="contained"
        disabled={disabled}
        onClick={() => {
          onSubmit({
            isJuggle,
            hashKey: hashKey ?? null,
          });
        }}
      >
        再デコード
      </Button>
    </FormControl>
  );
};

export default DecodeForm;
