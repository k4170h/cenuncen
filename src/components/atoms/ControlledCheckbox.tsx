import React, { ReactNode } from 'react';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: ReactNode;
  tooltip?: ReactNode;
};

const ControlledCheckbox = <T extends FieldValues>({
  control,
  name,
  label,
  tooltip,
}: Props<T>) => {
  return (
    <>
      <Tooltip title={tooltip ?? ''} placement="top">
        <FormControl>
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <>
                <FormControlLabel
                  label={label}
                  style={{ width: 'auto' }}
                  control={
                    <Checkbox {...field} checked={field.value} size="small" />
                  }
                />
              </>
            )}
          ></Controller>
        </FormControl>
      </Tooltip>
    </>
  );
};

export default ControlledCheckbox;
