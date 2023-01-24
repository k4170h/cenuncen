import React, { useCallback } from 'react';
import { RectArea } from '../../utils/types';
import {
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { COLOR_PALETTE } from '../../utils/definition';
import FormTitle from '../atoms/FormTitle';

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
    <Stack>
      <FormTitle>Selected Area List</FormTitle>
      <Table sx={{ width: 260 }} size="small">
        <TableBody>
          {selectedAreas.length === 0 && (
            <TableRow
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell colSpan={3}>not selected</TableCell>
            </TableRow>
          )}
          {selectedAreas.map((v, i) => {
            const key = areaToKey(v);
            return (
              <TableRow
                key={key}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell
                  padding="none"
                  style={{
                    width: '4px',
                    backgroundColor: COLOR_PALETTE[i % COLOR_PALETTE.length],
                  }}
                ></TableCell>
                <TableCell align="center" size="small">
                  [{v[0]},{v[1]},{v[2]},{v[3]}]
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => deleteArea(areaToKey(v))}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Stack>
  );
};

export default SelectedAreaList;

const areaToKey = (area: RectArea) => {
  return area.reduce((p, c) => p + c, '');
};
