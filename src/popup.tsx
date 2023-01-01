import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Decoder from './components/Decoder';
import Encoder from './components/Encoder';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Box, Button } from '@mui/material';

type Mode = 'encode' | 'decode';

const Popup = () => {
  const [mode, setMode] = useState<Mode>('encode');

  return (
    <Box
      // width={800}
      // height={600}
      overflow="auto"
      sx={{ border: '1px solid black' }}
    >
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
      {/* {mode === 'encode' && <Encoder />}
      {mode === 'decode' && <Decoder />} */}
      <Button
        onClick={() => {
          (async () => {
            const url = chrome.runtime.getURL('converter.html');
            const tab = await chrome.tabs.create({ url });
            console.log('tab is', tab);
          })();
        }}
      >
        aaaa
      </Button>
    </Box>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById('root')
);
