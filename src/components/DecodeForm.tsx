import { Button, Checkbox, FormControlLabel, TextField } from '@mui/material';
import React, { useState } from 'react';
import { DecodeOptions } from '../utils/types';
import { ButtonLi, ButtonUl } from './ButtonWrapper';
import CenteringBox from './CenteringBox';
import CropIcon from '@mui/icons-material/Crop';

type Props = {
  disabled: boolean;
  onSubmit: (options: DecodeOptions) => void;
};

const DecodeForm = ({ onSubmit, disabled }: Props) => {
  const [hashKey, setHashKey] = useState<string | undefined>();
  const [crop, setCrop] = useState<boolean>(false);

  return (
    <CenteringBox>
      <ButtonUl>
        <ButtonLi>
          <FormControlLabel
            style={{ display: 'block' }}
            control={
              <Checkbox
                {...{ checked: crop }}
                sx={{
                  marginTop: -1,
                }}
              />
            }
            label={<CropIcon />}
            disabled={disabled}
            onChange={(_, v) => {
              setCrop(v);
            }}
          />
        </ButtonLi>
        <ButtonLi>
          <TextField
            type="text"
            label="Key"
            style={{ width: '6em' }}
            size="small"
            onChange={(e) => {
              setHashKey(e.target.value);
            }}
            disabled={disabled}
          />
        </ButtonLi>
        <ButtonLi>
          <Button
            variant="contained"
            onClick={() => {
              onSubmit({
                hashKey: hashKey,
                crop: crop,
              });
            }}
          >
            retry
          </Button>
        </ButtonLi>
      </ButtonUl>
    </CenteringBox>
  );
};

export default DecodeForm;
