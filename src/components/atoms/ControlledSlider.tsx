import React, { ReactNode, useRef } from 'react';
import { FormControl, Slider, SliderProps, Typography } from '@mui/material';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Stack } from '@mui/system';
import styled from '@emotion/styled';

const Disabable = styled('div')({
  '&.disabled': {
    color: 'rgba(0, 0, 0, 0.38)',
  },
});

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  min: number;
  max: number;
  step: number;
  left?: ReactNode;
  right?: ReactNode;
  disabled?: boolean;
  label?: ReactNode;
} & SliderProps;

const ControlledSlider = <T extends FieldValues>({
  control,
  name,
  min,
  max,
  step,
  right,
  left,
  disabled,
  label,
  valueLabelFormat,
}: Props<T>) => {
  const lastValue = useRef<number[] | number>(0);

  return (
    <>
      <FormControl>
        <Disabable className={disabled ? 'disabled' : ''}>
          <Typography>{label}</Typography>
        </Disabable>
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Stack direction="row" spacing={2}>
              <Disabable className={disabled ? 'disabled' : ''}>
                {left}
              </Disabable>
              <Slider
                {...field}
                {...{ max, min, step, disabled }}
                onChange={(e: Event, v: number[] | number) => {
                  if (lastValue.current !== v) {
                    field.onChange(e);
                    lastValue.current = v;
                  }
                }}
                valueLabelDisplay="auto"
                valueLabelFormat={valueLabelFormat}
              />
              <Disabable className={disabled ? 'disabled' : ''}>
                {right}
              </Disabable>
            </Stack>
          )}
        />
      </FormControl>
    </>
  );
};

export default ControlledSlider;
