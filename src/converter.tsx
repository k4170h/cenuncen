import ReactDOM from 'react-dom';
import Decoder from './components/Decoder';
import Encoder from './components/Encoder';

import { Box } from '@mui/material';
import { useState } from 'react';
import React from 'react';
import Header from './components/Header';

type Mode = 'encode' | 'decode';

const Converter = () => {
  // 初期表示はdecoderにする。
  const [mode, setMode] = useState<Mode>('decode');

  return (
    <Box>
      <Header
        mode={mode}
        onChange={(v) => {
          setMode(v);
        }}
      />
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
