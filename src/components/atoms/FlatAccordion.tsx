import React from 'react';
import styled from '@emotion/styled';
import { ReactNode } from 'react';

const Accordion = styled('div')(() => ({
  transition: 'height ease-out .2s',
  '&.hide': {
    height: 0,
  },
  padding: 0,
  margin: 0,
  overflow: 'hidden',
}));

type Props = {
  children: NonNullable<ReactNode>;
  open: boolean;
  height: number;
};

export const FlatAccordion = ({ children, open, height }: Props) => {
  return (
    <Accordion
      className={open ? '' : 'hide'}
      style={{ height: open ? height : 0 }}
    >
      <div style={{ padding: '8px' }}>{children}</div>
    </Accordion>
  );
};
