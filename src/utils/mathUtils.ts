// 計算系のUtils

import jsSHA from 'jssha';

/**
 * 引数の文字列からHashを作る
 * @param key
 * @returns
 */
export const createHash = (key: string) => {
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  shaObj.update(key);
  return shaObj.getHash('HEX');
};

/**
 * Hashを1文字ずつ数値[0-15]に置き換えた配列にする
 * 引数の range で数値の範囲を引き延ばす
 * @param hash
 * @param range optional. default 16
 * @returns
 */
export const generateNumArrByHash = (hash: string, range = 16): number[] => {
  const matched = hash.match(/.{1}/g);
  if (matched == null) {
    throw new Error();
  }
  return matched.map((v) => {
    return parseInt(v, 16) * Math.ceil(range / 16);
  });
};

/**
 * v の最寄りの p の倍数を取得する
 * @param v
 * @param p
 * @returns
 */
export const getNear = (v: number, p: number) => {
  return p * Math.round(v / p);
};

/**
 * v の最寄りの p の倍数を取得する(ceil)
 * @param v
 * @param p
 * @returns
 */
export const getNearCeil = (v: number, p: number) => {
  return p * Math.ceil(v / p);
};

/**
 * hashに基づいて配列を混ぜる
 * @param arr
 * @param hash
 * @returns
 */
export const sortByHash = <T>(arr: T[], hash: string) => {
  const beforeArr = JSON.parse(JSON.stringify(arr));
  const hashes = generateNumArrByHash(hash, beforeArr.length);

  const ret = new Array(beforeArr.length).fill(null);
  let index = 0;
  while (0 < beforeArr.length) {
    const hashIndex = hashes[index % hashes.length] % beforeArr.length;
    ret[index] = beforeArr[hashIndex];
    beforeArr.splice(hashIndex, 1);
    index++;
  }
  return ret;
};

/**
 * hashに基づいて混ざっていた配列を戻す
 * @param arr
 * @param hash
 * @returns
 */
export const resortByHash = <T>(arr: T[], hash: string) => {
  const hashes = generateNumArrByHash(hash, arr.length);
  const ret = new Array(arr.length).fill(null);
  for (let i = 0; i < arr.length; i++) {
    const hashIndex = hashes[i % hashes.length];
    let c = 0,
      ite = 0;
    while (c <= hashIndex) {
      c = ret[ite % ret.length] == null ? c + 1 : c;
      ite++;
    }
    ite--;
    ret[ite % ret.length] = arr[i];
  }
  return ret;
};
