import React, { ReactNode } from 'react';
import {
  FormControl,
  InputAdornment,
  InputBaseComponentProps,
  TextField,
  TextFieldProps,
} from '@mui/material';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: ReactNode;
  type: 'text' | 'number';
  prefix?: string;
  suffix?: string;
  inputProps?: InputBaseComponentProps;
  width?: string;
  pattern?: RegExp;
} & TextFieldProps;

const ControlledTextarea = <T extends FieldValues>({
  control,
  name,
  label,
  type,
  prefix,
  suffix,
  inputProps,
  width,
  pattern,
}: Props<T>) => {
  return (
    <>
      <FormControl>
        <Controller
          control={control}
          name={name}
          rules={{
            required: true,
            pattern: pattern && {
              value: pattern,
              message: 'invalid Pattern ',
            },
          }}
          render={({ field, fieldState: { error, invalid } }) => {
            console.log(error?.message, invalid);
            return (
              <TextField
                type={type}
                size="small"
                {...field}
                label={label}
                error={!!error?.message}
                helperText={error?.message}
                style={{ width: width }}
                InputProps={{
                  startAdornment: prefix ? (
                    <InputAdornment position="start">{prefix}</InputAdornment>
                  ) : undefined,
                  endAdornment: suffix ? (
                    <InputAdornment position="end">{suffix}</InputAdornment>
                  ) : undefined,
                }}
                inputProps={inputProps}
              />
            );
          }}
        />
      </FormControl>
    </>
  );
};

export default ControlledTextarea;
