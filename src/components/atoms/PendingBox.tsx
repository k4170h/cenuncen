import React from 'react';
import styled from '@emotion/styled';

const StyledBox = styled('div')({
  position: 'fixed',
  width: '200px',
  top: 'calc(50% - 50px)',
  left: 'calc(50% - 50px)',
  zIndex: 1100,
  padding: '25px',
  textAlign: 'center',
  display: 'block',
  borderRadius: '8px',
  backgroundColor: '#fff',
  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
});

type Props = {
  show: boolean;
};

const PendingBox = ({ show }: Props) => {
  return <>{show && <StyledBox>in Progress ...</StyledBox>}</>;
};

export default PendingBox;
