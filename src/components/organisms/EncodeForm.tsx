import { Button, Stack } from '@mui/material';
import { Box } from '@mui/system';
import React, { useCallback } from 'react';
import { ClipPos, EncodeFormValues } from '../../utils/types';

import ShuffleIcon from '@mui/icons-material/Shuffle';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import Rotate90DegreesCwIcon from '@mui/icons-material/Rotate90DegreesCw';
import KeyIcon from '@mui/icons-material/Key';
import BorderBottomIcon from '@mui/icons-material/BorderBottom';
import BorderLeftIcon from '@mui/icons-material/BorderLeft';
import BorderTopIcon from '@mui/icons-material/BorderTop';
import BorderRightIcon from '@mui/icons-material/BorderRight';
import OpacityIcon from '@mui/icons-material/Opacity';
import { useForm } from 'react-hook-form';
import ControlledCheckbox from '../atoms/ControlledCheckbox';
import ControlledTextarea from '../atoms/ControlledTextarea';
import ControlledRadio from '../atoms/ControlledRadio';

type Props = {
  onSubmit: (options: EncodeFormValues) => void;
  disabled: boolean;
};

const defaultValues = {
  doSwap: true,
  doRotate: true,
  doNega: true,
  doColorShift: false,
  contrastLevel: 0.5,
  shiftColor: '000',
  withKey: false,
  key: '',
  pos: 'bottom' as ClipPos,
  fillColor: '000',
};

const radioItems = [
  { value: 'bottom', label: <BorderBottomIcon /> },
  { value: 'left', label: <BorderLeftIcon /> },
  { value: 'top', label: <BorderTopIcon /> },
  { value: 'right', label: <BorderRightIcon /> },
];

const EncodeForm = ({ onSubmit, disabled }: Props) => {
  const { control, watch, handleSubmit } = useForm<typeof defaultValues>({
    defaultValues,
  });

  const doShiftColor = watch('doColorShift');
  const withKey = watch('withKey');
  const handleSubmit_ = useCallback(
    (e: typeof defaultValues) => {
      onSubmit({
        gridSize: 0,
        noSwap: !e.doSwap,
        noNega: !e.doNega,
        noRotate: !e.doRotate,
        hashKey: e.withKey && e.key ? e.key : undefined,
        clipPos: e.pos,
        backgroundColor: e.fillColor,
        shiftColor: e.doColorShift
          ? {
              contrast: e.contrastLevel,
              color: e.shiftColor,
            }
          : undefined,
      });
    },
    [onSubmit]
  );
  return (
    <>
      <Stack
        component="form"
        spacing={2}
        onSubmit={handleSubmit(handleSubmit_)}
      >
        <Stack spacing={4} direction="row">
          <ControlledCheckbox
            control={control}
            name="doSwap"
            label={<ShuffleIcon style={{ verticalAlign: 'middle' }} />}
          />
          <ControlledCheckbox
            control={control}
            name="doRotate"
            label={
              <Rotate90DegreesCwIcon style={{ verticalAlign: 'middle' }} />
            }
          />
          <ControlledCheckbox
            control={control}
            name="doNega"
            label={<InvertColorsIcon style={{ verticalAlign: 'middle' }} />}
          />
        </Stack>
        <Stack direction="row">
          <ControlledCheckbox
            control={control}
            name="doColorShift"
            label={<OpacityIcon style={{ verticalAlign: 'middle' }} />}
          />
          {doShiftColor && (
            <Box>
              <ControlledTextarea
                control={control}
                name="contrastLevel"
                label="contrast level"
                type="number"
                prefix="0 &lt;"
                suffix="&lt; 1"
                inputProps={{
                  step: 0.1,
                  min: 0.1,
                  max: 0.9,
                }}
                width="8.5em"
              />
              <ControlledTextarea
                control={control}
                name="shiftColor"
                label="filter color"
                type="text"
                prefix="#"
                width="5em"
                pattern={/^([A-Fa-f0-9]{3})$/}
              />
            </Box>
          )}
        </Stack>
        <Stack direction="row">
          <ControlledCheckbox
            control={control}
            name="withKey"
            label={<KeyIcon style={{ verticalAlign: 'middle' }} />}
          />
          {withKey && (
            <Box>
              <ControlledTextarea
                control={control}
                name="key"
                label="key"
                type="text"
                width="5em"
              />
            </Box>
          )}
        </Stack>
        <ControlledTextarea
          control={control}
          name="fillColor"
          label="Fill Color"
          type="text"
          prefix="#"
          width="5em"
          pattern={/^([A-Fa-f0-9]{3})$/}
        />
        <ControlledRadio
          control={control}
          name="pos"
          label=""
          items={radioItems}
        />
        <Button type="submit" variant="contained" disabled={disabled}>
          Censoring
        </Button>
      </Stack>
    </>
  );
};

export default EncodeForm;
