import ReactDOM from 'react-dom';
import Encoder from './components/pages/Encoder';

import { useState } from 'react';
import React from 'react';
import { Page } from './utils/types';

const Converter = () => {
  // 初期表示はdecoderにする。
  const [page] = useState<Page>('encoder');

  return <>{page === 'encoder' && <Encoder />}</>;
};

ReactDOM.render(
  <React.StrictMode>
    <Converter />
  </React.StrictMode>,
  document.getElementById('root')
);
