import styled from '@emotion/styled';
import { Button } from '@mui/material';
import { Box } from '@mui/system';
import React, { ReactNode, useCallback } from 'react';
import InputIcon from '@mui/icons-material/Input';
import CropFreeIcon from '@mui/icons-material/CropFree';
import TuneIcon from '@mui/icons-material/Tune';
import OutputIcon from '@mui/icons-material/Output';

const StyledBox = styled(Box)({
  position: 'fixed',
  left: 0,
  top: '50%',
  backgroundColor: '#fff',
  zIndex: 900,
  boxShadow: '0 1px 3px 0px rgba(0,0,0,.2)',
  borderRadius: '0 8px 8px 0 ',
});

type Props = {
  when: boolean;
  children: ReactNode;
};

const Hideable = styled(Box)({
  '&.hide': {
    visibility: 'hidden',
    width: 0,
    height: 0,
  },
  position: 'absolute',
  top: 0,
});

const Hide = ({ when, children }: Props) => {
  return <Hideable className={when ? 'hide' : ''}>{children}</Hideable>;
};

export default Hide;
