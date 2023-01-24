import ReactDOM from 'react-dom';
import Decoder from './components/pages/Decoder';
import Encoder from './components/pages/Encoder';

import { useState } from 'react';
import React from 'react';
import { Page } from './utils/types';

const Converter = () => {
  // 初期表示はdecoderにする。
  const [page] = useState<Page>('encoder');

  return (
    <>
      {page === 'encoder' && <Encoder />}
      {page === 'decoder' && <Decoder />}
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Converter />
  </React.StrictMode>,
  document.getElementById('root')
);
