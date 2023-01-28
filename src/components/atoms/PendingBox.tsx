import React from 'react';
import styled from '@emotion/styled';
import { Box } from '@mui/system';
import { CircularProgress } from '@mui/material';

const StyledBox = styled(Box)({
  position: 'fixed',
  width: '100px',
  height: '100px',
  top: 'calc(50% - 50px)',
  left: 'calc(50% - 50px)',
  zIndex: 1100,
  padding: '25px',
  display: 'flex',
  borderRadius: '8px',
  backgroundColor: '#fff',
});

type Props = {
  show: boolean;
};

const PendingBox = ({ show }: Props) => {
  return (
    <>
      {show && (
        <StyledBox>
          <CircularProgress disableShrink size="50px" />
        </StyledBox>
      )}
    </>
  );
};

export default PendingBox;
