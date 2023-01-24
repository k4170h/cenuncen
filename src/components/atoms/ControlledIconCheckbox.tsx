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
  icon: ReactNode;
  checkedIcon: ReactNode;
};

const ControlledIconCheckbox = <T extends FieldValues>({
  control,
  name,
  label,
  tooltip,
  icon,
  checkedIcon,
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
                    <Checkbox
                      {...field}
                      icon={icon}
                      checkedIcon={
                        <span
                          style={{
                            color: '#fff',
                            backgroundColor: '#1976d2',
                            margin: 0,
                            padding: 0,
                            height: '1.5em',
                            borderRadius: '1.5em',
                          }}
                        >
                          {checkedIcon}
                        </span>
                      }
                      checked={field.value}
                      size="small"
                      style={{
                        padding: '4px',
                      }}
                    />
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

export default ControlledIconCheckbox;
