import React, { ReactNode } from 'react';
import { FormControl, FormControlLabel, Switch } from '@mui/material';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: ReactNode;
  disabled?: boolean;
};

const ControlledSwitch = <T extends FieldValues>({
  control,
  name,
  label,
  disabled,
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
                sx={{ width: 'auto' }}
                control={
                  <Switch
                    {...field}
                    checked={field.value}
                    size="small"
                    disabled={disabled}
                  />
                }
              />
            </>
          )}
        ></Controller>
      </FormControl>
    </>
  );
};

export default ControlledSwitch;
