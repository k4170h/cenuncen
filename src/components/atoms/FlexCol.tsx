import React from 'react';
import styled from '@emotion/styled';
import { ReactNode } from 'react';

const StyledBox = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  width: '100%',
  gap: '8px',
});

type Props = {
  children: ReactNode;
};
const FlexCol = ({ children }: Props) => {
  return <StyledBox>{children}</StyledBox>;
};

export default FlexCol;
