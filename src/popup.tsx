import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Decoder from './decoder';
import Encoder from './encoder';

type Mode = 'encode' | 'decode';

const Popup = () => {
  const [mode, setMode] = useState<Mode>('encode');

  return (
    <>
      <div style={{ width: '100%' }}>
        <button
          disabled={mode === 'encode'}
          onClick={() => {
            setMode('encode');
            console.log('click');
          }}
        >
          encode
        </button>
        <button
          disabled={mode == 'decode'}
          onClick={() => {
            setMode('decode');
          }}
        >
          decode
        </button>
        {mode === 'encode' && <Encoder />}
        {mode === 'decode' && <Decoder />}
      </div>
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById('root')
);
