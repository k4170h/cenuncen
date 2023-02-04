import React, { useEffect, useState } from 'react';
import { DeepRequired, useForm } from 'react-hook-form';
import {
  DEFAULT_AREA_SELECT_OPTION,
  MIN_PIXEL_BLOCK_WIDTH,
  MIN_PIXEL_GROUP_PADDING,
  MIN_RESIZED_IMAGE_WIDTH,
} from '../../utils/definition';
import SectionTitle from '../atoms/SectionTitle';
import { FormLi, FormUl } from '../atoms/FormList';
import { AreaSelectOptions } from '../../utils/types';
import InputRange from '../atoms/InputRange';
import InputChackbox from '../atoms/InputCheckbox';

type Props = {
  disabled: boolean;
  imageSize: [number, number];
  onChange: (v: AreaSelectOptions) => void;
  areaSelectOptions: AreaSelectOptions;
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
  const { watch, setValue, register } = useForm<AreaSelectOptions>({
    defaultValues: { ...areaSelectOptions },
    mode: 'onChange',
  });

  const gridSize = watch('gridSize');
  const spacing = watch('spacing');

  // Form内容更新時の処理
  useEffect(() => {
    const subscription = watch((values) => {
      onChange(values as DeepRequired<AreaSelectOptions>);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

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
      <SectionTitle>Area Select Option</SectionTitle>
      <FormUl>
        <FormLi>
          <InputRange
            register={register}
            disabled={disabled}
            name="gridSize"
            label="Grid size"
            min={minGridSize}
            max={minGridSize + 40}
            step={8}
            left={minGridSize}
            right={minGridSize + 40}
          />
        </FormLi>
        <FormLi>
          <InputRange
            register={register}
            disabled={disabled}
            name="spacing"
            label="Spacing"
            min={minSpacing}
            max={minSpacing + 5}
            step={1}
            left={minSpacing}
            right={minSpacing + 5}
          />
        </FormLi>
        <FormLi>
          <InputChackbox
            register={register}
            disabled={disabled}
            name="withColor"
            label="Coloring"
          />
        </FormLi>
      </FormUl>
    </>
  );
};

export default AreaSelectForm;
