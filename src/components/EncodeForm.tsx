import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  Slider,
  Stack,
  TextField,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { ClipPos, EncodeFormValues } from '../utils/types';

import Grid3x3OutlinedIcon from '@mui/icons-material/Grid3x3Outlined';
import Grid4x4OutlinedIcon from '@mui/icons-material/Grid4x4Outlined';
import { getNearCeil } from '../utils/mathUtils';

import ShuffleIcon from '@mui/icons-material/Shuffle';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import Rotate90DegreesCwIcon from '@mui/icons-material/Rotate90DegreesCw';
import KeyIcon from '@mui/icons-material/Key';
import BorderBottomIcon from '@mui/icons-material/BorderBottom';
import BorderLeftIcon from '@mui/icons-material/BorderLeft';
import BorderTopIcon from '@mui/icons-material/BorderTop';
import BorderRightIcon from '@mui/icons-material/BorderRight';

type Props = {
  minGridSize?: number;
  onSubmit: (options: EncodeFormValues) => void;
  disabled: boolean;
};

const EncodeForm = ({ onSubmit, disabled, minGridSize }: Props) => {
  const [gridSize, setGridSize] = useState(8);
  const [isSwap, setIsSwap] = useState(true);
  const [isNega, setIsNega] = useState(true);
  const [isRotate, setIsRotate] = useState(true);
  const [existsKey, setExistsKey] = useState(false);
  const [hashKey, setHashKey] = useState<string | null>(null);
  const [pos, setPos] = useState<ClipPos>('bottom');
  const [colorcode, setColorcode] = useState<string>('000');
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (minGridSize != null && gridSize < minGridSize) {
      setGridSize(getNearCeil(minGridSize, 8));
    }
  }, [minGridSize, gridSize]);

  const handleChangeColorcode = useCallback((code: string) => {
    const pattern = new RegExp(/^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);

    if (code == null || !pattern.test(code)) {
      setIsValid(false);
      setError('invalid color code.');
      return;
    }
    setError('');
    setIsValid(true);
    setColorcode(code);
  }, []);

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
      <Box>
        {getIconCheckbox(isSwap, disabled, setIsSwap, <ShuffleIcon />)}
        {getIconCheckbox(isNega, disabled, setIsNega, <InvertColorsIcon />)}
        {getIconCheckbox(
          isRotate,
          disabled,
          setIsRotate,
          <Rotate90DegreesCwIcon />
        )}
        <Box display="flex" alignItems="center">
          {getIconCheckbox(null, disabled, setExistsKey, <KeyIcon />)}
          {existsKey && (
            <TextField
              type="text"
              label="Key"
              style={{ width: '6em' }}
              size="small"
              disabled={disabled}
              onChange={(e) => {
                setHashKey(e.target.value);
              }}
            />
          )}
        </Box>
      </Box>
      <RadioGroup
        row
        defaultValue="bottom"
        onChange={(_, v) => setPos(v as ClipPos)}
      >
        <FormControlLabel
          value="bottom"
          control={<Radio />}
          label={<BorderBottomIcon />}
          disabled={disabled}
        />
        <FormControlLabel
          value="left"
          control={<Radio />}
          label={<BorderLeftIcon />}
          disabled={disabled}
        />
        <FormControlLabel
          value="top"
          control={<Radio />}
          label={<BorderTopIcon />}
          disabled={disabled}
        />
        <FormControlLabel
          value="right"
          control={<Radio />}
          label={<BorderRightIcon />}
          disabled={disabled}
        />
      </RadioGroup>

      <TextField
        type="text"
        label="colorcode"
        defaultValue={colorcode}
        style={{ width: '12em' }}
        size="small"
        disabled={disabled}
        onChange={(e) => {
          handleChangeColorcode(e.target.value);
        }}
        InputProps={{
          startAdornment: <InputAdornment position="start">#</InputAdornment>,
        }}
        error={!!error}
        helperText={error}
      />
      <Button
        variant="contained"
        disabled={disabled || !isValid}
        onClick={() => {
          onSubmit({
            gridSize,
            isSwap,
            isNega,
            isRotate,
            hashKey: existsKey ? hashKey : null,
            clipPos: pos,
            backgroundColor: colorcode,
          });
        }}
      >
        Censoring
      </Button>
    </FormControl>
  );
};

export default EncodeForm;

const getIconCheckbox = (
  value: boolean | null,
  disabled: boolean,
  onChange: (v: boolean) => void,
  label: ReactNode
) => {
  return (
    <FormControlLabel
      style={{ display: 'block' }}
      control={
        <Checkbox
          {...{ checked: value !== null ? value : undefined }}
          sx={{
            marginTop: -1,
          }}
        />
      }
      label={label}
      disabled={disabled}
      onChange={(_, v) => {
        onChange(v);
      }}
    />
  );
};
