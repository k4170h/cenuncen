import styled from '@emotion/styled';
import React from 'react';
import { ReactNode } from 'react';

const Ul = styled('ul')({
  margin: 0,
  padding: 0,
});
const Li = styled('li')({
  listStyle: 'none',
  margin: 0,
  padding: '15px 20px 15px 40px',
  borderBottom: '1px solid rgba(244, 244, 244, 1)',
});

type Props = {
  children: ReactNode;
};

export const FormUl = ({ children }: Props) => <Ul>{children}</Ul>;
export const FormLi = ({ children }: Props) => <Li>{children}</Li>;
