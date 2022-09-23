import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  TextField,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useRef, useState } from 'react';
import { Options } from '../types';

type Props = {
  minGridSize?: number;
  onSubmit: (options: Options) => void;
  disabled: boolean;
};

const EncodeForm = ({ onSubmit, disabled, minGridSize }: Props) => {
  const gridSize = useRef<HTMLInputElement>(null);
  const isReplacePosition = useRef<HTMLInputElement>(null);
  const isChangeColor = useRef<HTMLInputElement>(null);
  const hashKey = useRef<HTMLInputElement>(null);
  const [existsKey, setExistsKey] = useState(false);

  useEffect(() => {
    gridSize.current!.value = minGridSize + '';
    gridSize.current!.min = minGridSize + '';
  }, [minGridSize]);

  return (
    <FormControl>
      <TextField
        type="number"
        style={{ width: '6em' }}
        inputRef={gridSize}
        label="粒度"
        size="small"
        onBlur={(e) => {
          if (minGridSize && parseInt(e.target.value) < minGridSize) {
            e.target.value = minGridSize + '';
          }
        }}
        disabled={disabled}
      />
      <FormControlLabel
        control={<Checkbox defaultChecked />}
        label="位置混ぜ"
        inputRef={isReplacePosition}
        sx={{ display: 'inline-block' }}
        disabled={disabled}
      />
      <FormControlLabel
        control={<Checkbox defaultChecked />}
        label="色混ぜ"
        inputRef={isChangeColor}
        sx={{ display: 'inline-block' }}
        disabled={disabled}
      />
      <Box display="flex">
        <FormControlLabel
          control={
            <Checkbox
              onChange={(e) => {
                setExistsKey(e.target.checked);
              }}
            />
          }
          label="鍵"
          sx={{ display: 'inline-block' }}
          disabled={disabled}
        />
        {existsKey && (
          <TextField
            type="text"
            inputRef={hashKey}
            label="鍵"
            style={{ width: '6em' }}
            size="small"
            disabled={disabled}
          />
        )}
      </Box>
      <Button
        variant="contained"
        disabled={disabled}
        onClick={() => {
          onSubmit(
            optionsFromElement(
              gridSize,
              isReplacePosition,
              isChangeColor,
              hashKey,
              existsKey
            )
          );
        }}
      >
        エンコード
      </Button>
    </FormControl>
  );
};

export default EncodeForm;

const optionsFromElement = (
  gridSize_: React.RefObject<HTMLInputElement>,
  isReplacePosition_: React.RefObject<HTMLInputElement>,
  isChangeColor_: React.RefObject<HTMLInputElement>,
  hashKey_: React.RefObject<HTMLInputElement>,
  existsKey_: boolean
): Options => {
  if (
    gridSize_.current?.value == null ||
    isReplacePosition_.current == null ||
    isChangeColor_.current == null
  ) {
    throw new Error();
  }
  const gridSize = parseInt(gridSize_.current?.value);
  if (gridSize == null) {
    throw new Error();
  }
  const isReplacePosition = isReplacePosition_.current.checked;
  const isChangeColor = isChangeColor_.current.checked;
  const hashKey = !existsKey_
    ? null
    : hashKey_.current?.value == null
    ? null
    : hashKey_.current.value;

  return {
    gridSize,
    isReplacePosition,
    isChangeColor,
    hashKey,
  };
};
