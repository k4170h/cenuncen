import styled from '@emotion/styled';
import React from 'react';
import { ReactNode } from 'react';

const StyledH = styled('h2')({
  fontSize: '1.2em',
  fontWeight: 'bold',
  color: '#333',
  margin: '16px 0',
  marginBottom: 0,
  padding: '8px',
});

type Props = {
  children: ReactNode;
};
const PageTitle = ({ children }: Props) => {
  return <StyledH>{children}</StyledH>;
};

export default PageTitle;
