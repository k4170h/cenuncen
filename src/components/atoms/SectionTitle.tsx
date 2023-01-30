import styled from '@emotion/styled';
import React from 'react';
import { ReactNode } from 'react';

const StyledP = styled('h3')({
  fontSize: '1.2em',
  color: '#333',
  marginTop: '16px',
  marginBottom: 0,
  padding: '8px',
  borderTop: '2px solid #ce93d8',
});

type Props = {
  children: ReactNode;
};
const SectionTitle = ({ children }: Props) => {
  return <StyledP>{children}</StyledP>;
};

export default SectionTitle;
