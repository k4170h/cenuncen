import styled from '@emotion/styled';
import React, { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const Ul = styled('ul')({
  display: 'flex',
  justifyContent: 'center',
  padding: 0,
  margin: 0,
});

export const ButtonUl = ({ children }: Props) => {
  return <Ul>{children}</Ul>;
};

const Li = styled('li')({
  listStyle: 'none',
  display: 'block',
  margin: 4,
});
export const ButtonLi = ({ children }: Props) => {
  return <Li>{children}</Li>;
};
