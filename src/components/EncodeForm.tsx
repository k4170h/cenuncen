import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Slider,
  Stack,
  TextField,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { EncodeOptions } from '../types';

import Grid3x3OutlinedIcon from '@mui/icons-material/Grid3x3Outlined';
import Grid4x4OutlinedIcon from '@mui/icons-material/Grid4x4Outlined';
import { getNearCeil } from '../utils';

type Props = {
  minGridSize?: number;
  onSubmit: (options: EncodeOptions) => void;
  disabled: boolean;
};

const EncodeForm = ({ onSubmit, disabled, minGridSize }: Props) => {
  const [gridSize, setGridSize] = useState(8);
  const [isSwap, setIsSwap] = useState(true);
  const [isNega, setIsNega] = useState(false);
  const [isRotate, setIsRotate] = useState(true);
  const [existsKey, setExistsKey] = useState(false);
  const [hashKey, setHashKey] = useState<string | null>(null);

  useEffect(() => {
    if (minGridSize != null && gridSize < minGridSize) {
      setGridSize(getNearCeil(minGridSize, 8));
    }
  }, [minGridSize, gridSize]);

  return (
    <FormControl style={{ width: '100%' }}>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Grid4x4OutlinedIcon color={disabled ? 'disabled' : 'primary'} />
        <Slider
          value={gridSize}
          step={8}
          valueLabelDisplay="auto"
          min={getNearCeil(minGridSize ?? 8, 8)}
          max={getNearCeil(minGridSize ?? 8, 8) + 40}
          disabled={disabled}
          onChange={(_, v) => {
            setGridSize(v as number);
          }}
        />
        <Grid3x3OutlinedIcon color={disabled ? 'disabled' : 'primary'} />
      </Stack>

      <FormControlLabel
        control={<Checkbox checked={isSwap} />}
        label="入替"
        sx={{ display: 'inline-block' }}
        disabled={disabled}
        onChange={(_, v) => {
          setIsSwap(v);
        }}
      />
      <FormControlLabel
        control={<Checkbox checked={isNega} />}
        label="色反転"
        sx={{ display: 'inline-block' }}
        disabled={disabled}
        onChange={(_, v) => {
          setIsNega(v);
        }}
      />
      <FormControlLabel
        control={<Checkbox checked={isRotate} />}
        label="回転"
        sx={{ display: 'inline-block' }}
        disabled={disabled}
        onChange={(_, v) => {
          setIsRotate(v);
        }}
      />
      <Box display="flex">
        <FormControlLabel
          control={<Checkbox />}
          label="鍵"
          sx={{ display: 'inline-block' }}
          disabled={disabled}
          onChange={(_, v) => {
            setExistsKey(v);
          }}
        />
        {existsKey && (
          <TextField
            type="text"
            label="鍵"
            style={{ width: '6em' }}
            size="small"
            disabled={disabled}
            onChange={(e) => {
              setHashKey(e.target.value);
            }}
          />
        )}
      </Box>
      <Button
        variant="contained"
        disabled={disabled}
        onClick={() => {
          onSubmit({
            gridSize,
            isSwap,
            isNega,
            isRotate,
            hashKey: existsKey ? hashKey : null,
          });
        }}
      >
        エンコード
      </Button>
    </FormControl>
  );
};

export default EncodeForm;
