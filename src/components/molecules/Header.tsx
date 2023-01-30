import styled from '@emotion/styled';
import React from 'react';

const Wrapper = styled('div')({
  marginBottom: 4,
  position: 'fixed',
  top: 0,
  left: 0,
  backgroundColor: '#fff',
  boxShadow: '0 1px 3px 0px rgba(0,0,0,.2)',
  zIndex: 1000,
  borderRadius: '0 0 8px 0',
});

const Tab = styled('p')({
  display: 'inline-block',
  padding: '8px',
  margin: '0 10px',
  paddinBottom: '4px',
  cursor: 'pointer',
  '&.selected': {
    borderBottom: '4px solid #ab47bc',
  },
});

type Item<T> = {
  label: string;
  value: T;
};

type Props<T> = {
  onChange: (v: T) => void;
  items: Item<T>[];
  current: T;
};

const Header = <T,>({ onChange, items, current }: Props<T>) => {
  return (
    <Wrapper>
      {items?.map((v) => (
        <Tab
          onClick={() => onChange(v.value)}
          key={v.value + ''}
          className={current === v.value ? 'selected' : ''}
        >
          {v.label}
        </Tab>
      ))}
    </Wrapper>
  );
};

export default Header;
