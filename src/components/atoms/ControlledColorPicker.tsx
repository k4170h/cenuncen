import React, { useCallback, useState } from 'react';
import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Stack } from '@mui/system';
import styled from '@emotion/styled';
import { HexColorPicker } from 'react-colorful';
import ColorizeIcon from '@mui/icons-material/Colorize';

const Popover = styled('div')({
  position: 'absolute',
  top: 'calc(100% + 2px)',
  left: 0,
  borderRadius: '9px',
});

const Cover = styled('div')({
  position: 'fixed',
  top: '0px',
  right: '0px',
  bottom: '0px',
  left: '0px',
  zIndex: 100,
});

const PickerWrapper = styled('div')({
  backgroundColor: '#fff',
  position: 'absolute',
  zIndex: 200,
  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
});

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
};

const ControlledColorPicker = <T extends FieldValues>({
  control,
  name,
  label,
}: Props<T>) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [color, setColor] = useState('');
  const toggle = useCallback(() => {
    setDisplayColorPicker(!displayColorPicker);
  }, [displayColorPicker]);

  const close = useCallback(() => {
    setDisplayColorPicker(false);
  }, []);

  return (
    <>
      <FormControl>
        <Controller
          control={control}
          rules={{
            pattern: {
              value: /^([A-Fa-f0-9]{6})$/,
              message: 'invalid pattern',
            },
            required: 'required',
          }}
          name={name}
          render={({ field, fieldState }) => (
            <Stack direction="row" spacing={1} position="relative">
              <TextField
                type="string"
                size="small"
                {...field}
                label={label}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">#</InputAdornment>
                  ),
                }}
                error={fieldState.invalid}
                // helperText={fieldState.error?.message ?? ' '}
                style={{ width: '7em' }}
              />
              <IconButton
                style={{
                  borderRadius: 4,
                  margin: 4,
                  padding: 4,
                  width: '2em',
                  border: 'rgba(0,0,0,.5) solid 1px',
                }}
                onClick={toggle}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: `#${field.value}`,
                  }}
                ></div>
              </IconButton>
              {displayColorPicker && (
                <Popover>
                  <PickerWrapper className="custom">
                    <Stack>
                      <HexColorPicker
                        color={field.value}
                        onChange={(c) => {
                          // field.onChange({ target: { value: c.slice(1) } });
                          setColor(c.slice(1));
                        }}
                      />
                      <Button
                        onClick={() => {
                          field.onChange({ target: { value: color } });
                          close();
                        }}
                      >
                        OK
                      </Button>
                    </Stack>
                  </PickerWrapper>
                  <Cover
                    onClick={() => {
                      field.onChange({ target: { value: color } });
                      close();
                    }}
                  />
                </Popover>
              )}
            </Stack>
          )}
        />
      </FormControl>
    </>
  );
};

export default ControlledColorPicker;
