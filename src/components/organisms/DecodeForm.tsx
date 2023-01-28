import { Stack } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import ControlledTextarea from '../atoms/ControlledTextarea';
import { DEFAULT_DECODE_OPTIONS } from '../../utils/definition';
import ControlledSwitch from '../atoms/ControlledSwitch';
import ControlledSlider from '../atoms/ControlledSlider';
import { FormLi, FormUl } from '../atoms/FormList';
import { DecodeOptions } from '../../utils/types';

type Props = {
  onChange?: (v: DecodeOptions) => void;
  decodeOptions?: DecodeOptions;
  disabled?: boolean;
};

const DecodeForm = ({ onChange, decodeOptions, disabled }: Props) => {
  const { control, watch } = useForm<DecodeOptions>({
    defaultValues: decodeOptions,
    mode: 'onChange',
  });
  const watchForm = watch();
  const lastFormValue = useRef(JSON.stringify(DEFAULT_DECODE_OPTIONS));

  useEffect(() => {
    const watchFormStr = JSON.stringify(watchForm);
    if (lastFormValue.current !== watchFormStr) {
      lastFormValue.current = watchFormStr;
      onChange && onChange(watchForm);
    }
  }, [onChange, watchForm]);

  return (
    <FormUl>
      <FormLi>
        <ControlledSwitch
          control={control}
          name="doCrop"
          label={<>clip</>}
          disabled={disabled}
        />
      </FormLi>
      <FormLi>
        {/* <ControlledTextarea
          control={control}
          name="padding"
          label={<>padding</>}
          disabled={disabled}
          type="number"
        /> */}
        <Stack>
          <ControlledSlider
            control={control}
            name="padding"
            min={0}
            max={6}
            step={1}
            disabled={disabled}
            label="Padding"
          />
          <ControlledSlider
            control={control}
            name="offsetX"
            min={-3}
            max={3}
            step={1}
            disabled={disabled}
            label="Offset"
            left="X"
          />
          <ControlledSlider
            control={control}
            name="offsetY"
            min={-3}
            max={3}
            step={1}
            disabled={disabled}
            left="Y"
          />
        </Stack>
      </FormLi>
      <FormLi>
        <ControlledTextarea
          control={control}
          name="key"
          label="key"
          type="text"
          width="5em"
          disabled={disabled}
        />
      </FormLi>
    </FormUl>
  );
};

export default DecodeForm;
