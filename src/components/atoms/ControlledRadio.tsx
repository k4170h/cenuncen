import React, { ReactNode } from 'react';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Stack } from '@mui/system';

export type Item = {
  value: string;
  label: ReactNode;
};

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: ReactNode;
  items: Item[];
};

const ControlledRadio = <T extends FieldValues>({
  control,
  name,
  items,
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
                <Stack direction="row">
                  {items.map((radio: Item) => (
                    <FormControlLabel
                      {...field}
                      key={radio.value}
                      label={radio.label}
                      value={radio.value}
                      control={<Radio />}
                    />
                  ))}
                </Stack>
              </RadioGroup>
            </>
          )}
        ></Controller>
      </FormControl>
    </>
  );
};

export default ControlledRadio;
