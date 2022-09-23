import React, { useCallback } from 'react';
import { RectArea } from '../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

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
    <Table sx={{ width: 400 }} size="small">
      <TableHead>
        <TableRow>
          <TableCell align="center">X</TableCell>
          <TableCell align="center">Y</TableCell>
          <TableCell align="center">W</TableCell>
          <TableCell align="center">H</TableCell>
          <TableCell align="center"></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {selectedAreas.length === 0 && (
          <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell align="center" colSpan={5}>
              not selected
            </TableCell>
          </TableRow>
        )}
        {selectedAreas.map((v, i) => {
          const key = areaToKey(v);
          return (
            <TableRow
              key={key}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="center">{v[0]}</TableCell>
              <TableCell align="center">{v[1]}</TableCell>
              <TableCell align="center">{v[2]}</TableCell>
              <TableCell align="center">{v[3]}</TableCell>
              <TableCell align="center">
                <DeleteIcon
                  onClick={() => deleteArea(areaToKey(v))}
                  sx={{ cursor: 'pointer' }}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default SelectedAreaList;

const areaToKey = (area: RectArea) => area.reduce((p, c) => p + c, '');
