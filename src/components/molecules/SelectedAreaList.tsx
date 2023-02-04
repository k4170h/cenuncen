import React, { useCallback } from 'react';
import { RectArea } from '../../utils/types';
import { COLOR_PALETTE } from '../../utils/definition';
import SectionTitle from '../atoms/SectionTitle';
import Button from '../atoms/Button';

type Props = {
  selectedAreas: RectArea[];
  onUpdateList: (areas: RectArea[]) => void;
};

const SelectedAreaList = ({ selectedAreas, onUpdateList }: Props) => {
  // const onUpdateList = (imageData: Areas) => {
  const deleteArea = useCallback(
    (key: string) => {
      onUpdateList(selectedAreas.filter((v) => areaToKey(v) !== key));
    },
    [selectedAreas, onUpdateList]
  );
  // };

  return (
    <>
      <SectionTitle>Selected Area List</SectionTitle>
      <table style={{ width: 260 }}>
        <tbody>
          {selectedAreas.length === 0 && (
            <tr>
              <td colSpan={3}>not selected</td>
            </tr>
          )}
          {selectedAreas.map((v, i) => {
            const key = areaToKey(v);
            return (
              <tr key={key}>
                <td
                  style={{
                    padding: 'none',
                    width: '4px',
                    backgroundColor: COLOR_PALETTE[i % COLOR_PALETTE.length],
                  }}
                ></td>
                <td align="center" style={{ fontSize: '0.8em' }}>
                  [{v[0]},{v[1]},{v[2]},{v[3]}]
                </td>
                <td align="center">
                  <Button onClick={() => deleteArea(areaToKey(v))}>
                    REMOVE
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default SelectedAreaList;

const areaToKey = (area: RectArea) => {
  return area.reduce((p, c) => p + c, '');
};
