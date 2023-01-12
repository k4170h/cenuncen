import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { ReactNode, useCallback, useState } from 'react';
import { ClipPos, EncodeFormValues } from '../utils/types';

import ShuffleIcon from '@mui/icons-material/Shuffle';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import Rotate90DegreesCwIcon from '@mui/icons-material/Rotate90DegreesCw';
import KeyIcon from '@mui/icons-material/Key';
import BorderBottomIcon from '@mui/icons-material/BorderBottom';
import BorderLeftIcon from '@mui/icons-material/BorderLeft';
import BorderTopIcon from '@mui/icons-material/BorderTop';
import BorderRightIcon from '@mui/icons-material/BorderRight';
import OpacityIcon from '@mui/icons-material/Opacity';

type Props = {
  onSubmit: (options: EncodeFormValues) => void;
  disabled: boolean;
};

const EncodeForm = ({ onSubmit, disabled }: Props) => {
  const [isSwap, setIsSwap] = useState(true);
  const [isNega, setIsNega] = useState(true);
  const [isRotate, setIsRotate] = useState(true);
  const [existsKey, setExistsKey] = useState(false);
  const [hashKey, setHashKey] = useState<string | null>(null);
  const [pos, setPos] = useState<ClipPos>('bottom');
  const [colorcode, setColorcode] = useState<string>('fff');
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contrastLevel, setContrastLevel] = useState(0.5);
  const [isColorShift, setIsColorShift] = useState(false);
  const [shiftColor, setShiftColor] = useState<string>('fff');

  const handleChangeColorcode = useCallback((code: string) => {
    const pattern = new RegExp(/^([A-Fa-f0-9]{3})$/);

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
      <Box>
        {getIconCheckbox(isSwap, disabled, setIsSwap, <ShuffleIcon />)}
        {getIconCheckbox(
          isRotate,
          disabled,
          setIsRotate,
          <Rotate90DegreesCwIcon />
        )}
        {getIconCheckbox(isNega, disabled, setIsNega, <InvertColorsIcon />)}
        <Box alignItems="center" display="flex">
          {getIconCheckbox(null, disabled, setIsColorShift, <OpacityIcon />)}
          {isColorShift && (
            <TextField
              type="number"
              label="contrastLevel"
              style={{ width: '8em' }}
              size="small"
              disabled={disabled}
              defaultValue={contrastLevel}
              onChange={(e) => {
                setContrastLevel(Number(e.target.value));
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">0 &lt;</InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">&lt; 1</InputAdornment>
                ),
              }}
              inputProps={{
                step: 0.1,
                min: 0.1,
                max: 0.9,
              }}
            />
          )}
        </Box>
        {isColorShift && (
          <Box>
            <TextField
              type="text"
              label="filterColor"
              defaultValue={colorcode}
              style={{ width: '5em', marginBottom: '8px' }}
              size="small"
              disabled={disabled}
              onChange={(e) => {
                setShiftColor(e.target.value);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">#</InputAdornment>
                ),
              }}
              error={!!error}
              helperText={error}
            />
            <Box
              width={16}
              height={39}
              sx={{ backgroundColor: '#' + colorcode }}
              ml={1}
            ></Box>
          </Box>
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

      <Box display="flex">
        <TextField
          type="text"
          label="fill color"
          defaultValue={colorcode}
          style={{ width: '8em', marginBottom: '8px' }}
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
        <Box
          width={16}
          height={39}
          sx={{ backgroundColor: '#' + colorcode }}
          ml={1}
        ></Box>
      </Box>
      <Button
        variant="contained"
        disabled={disabled || !isValid}
        onClick={() => {
          onSubmit({
            gridSize: 0,
            noSwap: !isSwap,
            noNega: !isNega,
            noRotate: !isRotate,
            hashKey: existsKey && hashKey ? hashKey : undefined,
            clipPos: pos,
            backgroundColor: colorcode,
            shiftColor: isColorShift
              ? {
                  contrast: contrastLevel,
                  color: shiftColor,
                }
              : undefined,
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
