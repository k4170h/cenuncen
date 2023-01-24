import { Stack } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  DEFAULT_AREA_SELECT_OPTION,
  MIN_PIXEL_BLOCK_WIDTH,
  MIN_PIXEL_GROUP_PADDING,
  MIN_RESIZED_IMAGE_WIDTH,
} from '../../utils/definition';
import ControlledSlider from '../atoms/ControlledSlider';
import GridViewSharpIcon from '@mui/icons-material/GridViewSharp';
import AppsIcon from '@mui/icons-material/Apps';
import FormTitle from '../atoms/FormTitle';
import WidthFullSharpIcon from '@mui/icons-material/WidthFullSharp';
import WidthNormalSharpIcon from '@mui/icons-material/WidthNormalSharp';
import ControlledSwitch from '../atoms/ControlledSwitch';
import { FormLi, FormUl } from '../atoms/FormList';

type Props = {
  disabled: boolean;
  imageSize: [number, number];
  onChange: (v: typeof DEFAULT_AREA_SELECT_OPTION) => void;
  areaSelectOptions: typeof DEFAULT_AREA_SELECT_OPTION;
};

const AreaSelectForm = ({
  disabled,
  imageSize,
  areaSelectOptions,
  onChange,
}: Props) => {
  const [minGridSize, setMinGridSize] = useState(
    DEFAULT_AREA_SELECT_OPTION.gridSize
  );
  const [minSpacing, setMinSpacing] = useState(
    DEFAULT_AREA_SELECT_OPTION.spacing
  );
  const { control, watch, setValue } = useForm<
    typeof DEFAULT_AREA_SELECT_OPTION
  >({
    defaultValues: { ...areaSelectOptions },
    mode: 'onChange',
  });

  const lastFormValue = useRef('');

  const watchForm = watch();
  const gridSize = watch('gridSize');
  const spacing = watch('spacing');

  useEffect(() => {
    const watchFormStr = JSON.stringify(watchForm);
    if (lastFormValue.current !== watchFormStr) {
      lastFormValue.current = watchFormStr;
      onChange(watchForm);
    }
  }, [watchForm, onChange]);

  // グリッド最小幅を算出
  useEffect(() => {
    const longStroke =
      imageSize[0] > imageSize[1] ? imageSize[0] : imageSize[1];
    let minGridSize = Math.ceil(
      (MIN_PIXEL_BLOCK_WIDTH * longStroke) / MIN_RESIZED_IMAGE_WIDTH
    );
    minGridSize = minGridSize + (8 - (minGridSize % 8));
    if (minGridSize < MIN_PIXEL_BLOCK_WIDTH) {
      minGridSize = MIN_PIXEL_BLOCK_WIDTH;
    }
    setMinGridSize(minGridSize);

    let minSpacing = Math.ceil(
      (MIN_PIXEL_GROUP_PADDING * longStroke) / MIN_RESIZED_IMAGE_WIDTH
    );
    if (minSpacing < MIN_PIXEL_GROUP_PADDING) {
      minSpacing = MIN_PIXEL_GROUP_PADDING;
    }
    setMinSpacing(minSpacing);
  }, [imageSize]);

  // グリッド最小幅が更新されたら入力値をリセット
  useEffect(() => {
    if (gridSize < minGridSize) {
      setValue('gridSize', minGridSize);
    }
    if (spacing < minSpacing) {
      setValue('spacing', minSpacing);
    }
  }, [setValue, minGridSize, minSpacing, gridSize, spacing]);

  return (
    <>
      <FormTitle>Area Select Option</FormTitle>
      <FormUl>
        <FormLi>
          <Stack>
            <ControlledSlider
              control={control}
              name="gridSize"
              min={minGridSize}
              max={minGridSize + 40}
              step={8}
              right={<GridViewSharpIcon />}
              left={<AppsIcon />}
              disabled={disabled}
              label="Block size"
            />
          </Stack>
        </FormLi>
        <FormLi>
          <Stack>
            <ControlledSlider
              control={control}
              name="spacing"
              min={minSpacing}
              max={minSpacing + 5}
              step={1}
              right={<WidthFullSharpIcon />}
              left={<WidthNormalSharpIcon />}
              disabled={disabled}
              label="Spacing"
            />
          </Stack>
        </FormLi>
        <FormLi>
          <ControlledSwitch
            control={control}
            name="withColor"
            disabled={disabled}
            label="Coloring"
          />
        </FormLi>
      </FormUl>
    </>
  );
};

export default AreaSelectForm;
