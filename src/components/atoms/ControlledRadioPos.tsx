import React, { ReactNode } from 'react';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Tooltip,
} from '@mui/material';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import styled from '@emotion/styled';
import ImageIcon from '@mui/icons-material/Image';

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
};

const RadioWrapper = styled('div')({
  position: 'relative',
  height: '120px',
  width: '160px',
});

const StyledRadio = styled(Radio)({
  position: 'absolute',
  display: 'block',
  width: '42px',
  height: '42px',
});

const Icon = styled(ImageIcon)({
  position: 'absolute',
  display: 'block',
  height: '40px',
  width: '40px',
  top: 'calc(50% - 20px)',
  left: 'calc(50% - 20px)',
});

const items = [
  {
    value: 'left',
    style: {
      top: 'calc(50% - 20px)',
      left: '0%',
    },
  },
  {
    value: 'top',
    style: {
      top: '0%',
      left: 'calc(50% - 20px)',
    },
  },
  {
    value: 'right',
    style: {
      top: 'calc(50% - 20px)',
      left: 'calc(100% - 40px)',
    },
  },
  {
    value: 'bottom',
    style: {
      top: 'calc(100% - 40px)',
      left: 'calc(50% - 20px)',
    },
  },
] as const;

const ControlledRadioPos = <T extends FieldValues>({
  control,
  name,
}: Props<T>) => {
  return (
    <>
      <FormControl>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <>
              <RadioGroup value={field.value}>
                <RadioWrapper>
                  {items.map((item) => (
                    <StyledRadio
                      {...field}
                      value={item.value}
                      key={item.value}
                      style={item.style}
                    />
                  ))}
                  <Icon />
                </RadioWrapper>
              </RadioGroup>
            </>
          )}
        ></Controller>
      </FormControl>
    </>
  );
};

export default ControlledRadioPos;
