import ReactDOM from 'react-dom';
import Encoder from './components/pages/Encoder';

import { useEffect, useState } from 'react';
import React from 'react';
import { Page } from './utils/types';
import queryString from 'query-string';

const Converter = () => {
  const [page, setPage] = useState<Page>();
  const query = queryString.parse(document.location.search);
  useEffect(() => {
    const d = query['d'] as string;
    if (d === '1' || d === undefined) {
      setPage('decode');
    } else {
      setPage('encode');
    }
  }, [query]);

  return <>{page && <Encoder page={page} />}</>;
};

ReactDOM.render(
  <React.StrictMode>
    <Converter />
  </React.StrictMode>,
  document.getElementById('root')
);
