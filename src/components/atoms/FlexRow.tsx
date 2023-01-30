import React from 'react';
import styled from '@emotion/styled';
import { ReactNode } from 'react';

const StyledBox = styled('div')({
  display: 'flex',
  flexWrap: 'nowrap',
  width: '100%',
  gap: '8px',
});

type Props = {
  children: ReactNode;
};
const FlexRow = ({ children }: Props) => {
  return <StyledBox>{children}</StyledBox>;
};

export default FlexRow;
