import styled from '@emotion/styled';
import React, { ReactNode } from 'react';

type Props<T> = {
  children: ReactNode;
  disabled?: boolean;
  value?: T;
  onClick?: (v?: T) => void;
  type?: 'submit' | 'button' | 'reset';
  style?: React.CSSProperties;
};

const StyledButton = styled('button')({
  padding: '6px 16px',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: '#ab47bc',
  color: '#fff',
  fontSize: '0.9em',
  letterSpacing: '0.02em',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'background-color linear .2s ',
  boxShadow: '0 1px 3px 0px rgba(0,0,0,.2)',
  '&:disabled': {
    backgroundColor: '#ab47bccc',
    color: '#fffa',
    cursor: 'default',
  },
  '&:hover': {
    backgroundColor: '#ab47bccc',
  },
  '&:active': {
    backgroundColor: '#ab47bcaa',
  },
});

const Button = <T,>({ children, disabled, value, onClick, type }: Props<T>) => {
  return (
    <StyledButton
      type={type ?? 'button'}
      onClick={(e) => {
        onClick && onClick(value ? value : undefined);
      }}
      disabled={disabled}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
