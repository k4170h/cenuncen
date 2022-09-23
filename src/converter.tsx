import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Decoder from './components/Decoder';
import Encoder from './components/Encoder';
import * as cbc from './colorByteCode';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Box, Paper } from '@mui/material';

type Mode = 'encode' | 'decode';

const Converter = () => {
  const [mode, setMode] = useState<Mode>('encode');

  return (
    <Box>
      <Tabs
        value={mode}
        onChange={(e, v) => {
          setMode(v);
        }}
        style={{ marginBottom: 4 }}
      >
        <Tab label="Encode" value="encode" />
        <Tab label="Decode" value="decode" />
      </Tabs>
      {mode === 'encode' && <Encoder />}
      {mode === 'decode' && <Decoder />}
    </Box>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Converter />
  </React.StrictMode>,
  document.getElementById('root')
);
