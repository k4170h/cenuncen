import React, { ReactNode } from 'react';
import { Checkbox, FormControl, FormControlLabel } from '@mui/material';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: ReactNode;
};

const ControlledCheckbox = <T extends FieldValues>({
  control,
  name,
  label,
}: Props<T>) => {
  return (
    <>
      <FormControl>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <>
              <FormControlLabel
                label={label}
                style={{ width: 'auto' }}
                control={<Checkbox {...field} checked={field.value} />}
              />
            </>
          )}
        ></Controller>
      </FormControl>
    </>
  );
};

export default ControlledCheckbox;
