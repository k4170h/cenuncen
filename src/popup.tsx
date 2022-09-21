import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Decoder from './Decoder';
import Encoder from './Encoder';
import * as cbc from './colorByteCode';

type Mode = 'encode' | 'decode';

const Popup = () => {
  const [mode, setMode] = useState<Mode>('encode');

  const clk = () => {
    cbc.dataToColorByteCode(
      {
        v: 1,
        o: {
          s: 81,
          z: 60,
        },
        c: [
          [1, 1, 20, 20],
          [1, 1, 20, 20],
          [1, 1, 20, 20],
          [1, 1, 20, 20],
        ],
        dummy:
          'this is dummy text , this is dummy text , this is dummy text , this is dummy text , this is dummy text , this is dummy text',
      },
      1200,
      1600
    );
  };
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
          disabled={mode === 'decode'}
          onClick={() => {
            setMode('decode');
          }}
        >
          decode
        </button>
        {mode === 'encode' && <Encoder />}
        {mode === 'decode' && <Decoder />}
      </div>
      <button onClick={() => clk()}>btn</button>

      <canvas id="BOARD1" width="200" height="200"></canvas>
      <canvas id="BOARD2" width="200" height="200"></canvas>
      <canvas id="BOARD3" width="200" height="200"></canvas>
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById('root')
);
