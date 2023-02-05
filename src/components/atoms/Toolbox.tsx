import styled from '@emotion/styled';
import React from 'react';
import { ReactNode } from 'react';

const StyledBlock = styled('div')({
  position: 'fixed',
  backgroundColor: '#fff',
  width: '300px',
  bottom: '0',
  right: '0',
  zIndex: 1000,
  height: '100%',
  boxShadow: '0 1px 3px 0px rgba(0,0,0,.2)',
  overflowY: 'auto',
  transition: 'right ease-out .2s',
  '&.hide': {
    right: '-300px',
  },
});

const StyledTitle = styled('h2')({
  fontSize: '1.2em',
  fontWeight: 'bold',
  color: '#333',
  margin: '0',
  marginBottom: 0,
  //   padding: '8px',
  backgroundColor: '#eee',

  visibility: 'hidden',
});

const StyledBody = styled('div')({
  padding: '0  20px  20px 20px',
});

type Props = {
  children: ReactNode;
};
export const Toolbox = ({ children, hide }: Props & { hide?: boolean }) => {
  return <StyledBlock className={hide ? 'hide' : ''}>{children}</StyledBlock>;
};

export const ToolboxHead = ({ children }: Props) => {
  return <StyledTitle>{children}</StyledTitle>;
};

export const ToolboxBody = ({ children }: Props) => {
  return <StyledBody>{children}</StyledBody>;
};
