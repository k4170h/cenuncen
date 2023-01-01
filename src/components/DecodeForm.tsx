import { Box, Button, FormControl, TextField } from '@mui/material';
import React, { useState } from 'react';
import { DecodeOptions } from '../utils/types';

type Props = {
  onSubmit: (options: DecodeOptions) => void;
};

const DecodeForm = ({ onSubmit }: Props) => {
  const [hashKey, setHashKey] = useState<string | undefined>();

  return (
    <Box textAlign="center">
      <TextField
        type="text"
        label="鍵"
        style={{ width: '6em' }}
        size="small"
        onChange={(e) => {
          setHashKey(e.target.value);
        }}
      />
      <Button
        variant="contained"
        onClick={() => {
          onSubmit({
            hashKey: hashKey,
          });
        }}
      >
        再デコード
      </Button>
    </Box>
  );
};

export default DecodeForm;
