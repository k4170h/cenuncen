import { Box, Tab, Tabs } from '@mui/material';
import React from 'react';

type Props = {
  onChange: (v: 'encode' | 'decode') => void;
  mode: 'encode' | 'decode';
};

const Header = ({ onChange, mode }: Props) => {
  return (
    <>
      <Box height={48} m={1}>
        {' '}
      </Box>
      <Tabs
        value={mode}
        onChange={(e, v) => onChange(v)}
        style={{
          marginBottom: 4,
          position: 'fixed',
          height: 48,
          top: 0,
          left: 0,
          backgroundColor: '#fff',
          width: '100%',
          boxShadow: '0 1px 3px 0px rgba(0,0,0,.2)',
          zIndex: 1000,
        }}
      >
        <Tab label="Encode" value="encode" />
        <Tab label="Decode" value="decode" />
      </Tabs>
    </>
  );
};

export default Header;
