import { Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import { DecodeOptions } from '../utils/types';
import { ButtonLi, ButtonUl } from './ButtonWrapper';
import CenteringBox from './CenteringBox';

type Props = {
  onSubmit: (options: DecodeOptions) => void;
};

const DecodeForm = ({ onSubmit }: Props) => {
  const [hashKey, setHashKey] = useState<string | undefined>();

  return (
    <CenteringBox>
      <ButtonUl>
        <ButtonLi>
          <TextField
            type="text"
            label="Hashkey"
            style={{ width: '6em' }}
            size="small"
            onChange={(e) => {
              setHashKey(e.target.value);
            }}
          />
        </ButtonLi>
        <ButtonLi>
          <Button
            variant="contained"
            onClick={() => {
              onSubmit({
                hashKey: hashKey,
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
