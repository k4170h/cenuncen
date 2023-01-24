import { Box, Tab, Tabs } from '@mui/material';
import React from 'react';
import { Page } from '../../utils/types';

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
    <>
      <Tabs
        value={current}
        onChange={(e, v) => onChange(v)}
        style={{
          marginBottom: 4,
          position: 'fixed',
          height: 48,
          top: 0,
          left: 0,
          backgroundColor: '#fff',
          boxShadow: '0 1px 3px 0px rgba(0,0,0,.2)',
          zIndex: 1000,
          borderRadius: '0 0 8px 0',
        }}
      >
        {items?.map((v) => (
          <Tab {...v} key={v.value + ''} />
        ))}
      </Tabs>
    </>
  );
};

export default Header;
