import React from 'react';
import styled from '@emotion/styled';
import { ReactNode } from 'react';

const StyledBox = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

type Props = {
  children: ReactNode;
};
const CenteringBox = ({ children }: Props) => {
  return <StyledBox>{children}</StyledBox>;
};

export default CenteringBox;
