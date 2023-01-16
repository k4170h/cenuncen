import { Button, Stack } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { DecodeOptions } from '../../utils/types';
import CropIcon from '@mui/icons-material/Crop';
import ControlledCheckbox from '../atoms/ControlledCheckbox';
import { useForm } from 'react-hook-form';
import ControlledTextarea from '../atoms/ControlledTextarea';

type Props = {
  disabled: boolean;
  onSubmit: (options: DecodeOptions) => void;
};

const defaultValues = {
  doCrop: false,
  key: '',
};

const DecodeForm = ({ onSubmit }: Props) => {
  const { control, handleSubmit } = useForm<typeof defaultValues>({
    defaultValues,
  });
  const handleSubmit_ = useCallback((e) => {
    onSubmit({
      hashKey: e.key,
      crop: e.doCrop,
    });
  }, []);

  return (
    <Stack
      spacing={2}
      direction="row"
      component="form"
      onSubmit={handleSubmit(handleSubmit_)}
      m={2}
    >
      <ControlledCheckbox
        control={control}
        name="doCrop"
        label={<CropIcon style={{ verticalAlign: 'middle' }} />}
      />

      <ControlledTextarea
        control={control}
        name="key"
        label="key"
        type="text"
        width="5em"
      />

      <Button type="submit" variant="contained">
        retry
      </Button>
    </Stack>
  );
};

export default DecodeForm;
