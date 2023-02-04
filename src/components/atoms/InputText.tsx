import styled from '@emotion/styled';
import React, { ReactNode } from 'react';
import {
  FieldError,
  FieldValues,
  Path,
  UseFormRegister,
} from 'react-hook-form';

type Props<T extends FieldValues> = {
  register: UseFormRegister<T>;
  name: Path<T>;
  label?: ReactNode;
  prefix?: string;
  suffix?: string;
  width?: string;
  pattern?: RegExp;
  required?: boolean;
  disabled?: boolean;
  error?: FieldError;
};

const StyledInput = styled('input')({
  position: 'absolute',
  top: 0,
  left: 0,
  padding: '4px 8px',
  paddingLeft: '2em',
  backgroundColor: 'transparent',
  border: 'solid 1px #aaa',
  borderRadius: '2px',
  width: '100%',
  '&:focus': {
    outline: 'none',
  },
});
const StyledDiv = styled('div')({
  position: 'relative',
  '&:before': {
    content: 'attr(data-before)',
    color: '#333a',
    padding: '4px',
    lineHeight: '1.5em',
  },
  backgroundColor: '#fff',
});

const InputText = <T extends FieldValues>({
  name,
  register,
  label,
  prefix,
  suffix,
  width,
  pattern,
  required,
  disabled,
  error,
}: Props<T>) => {
  return (
    <div style={{ width: '100%', display: 'inline-block' }}>
      <label style={{ opacity: disabled ? 0.5 : 1 }}>{label}</label>
      <StyledDiv data-before={prefix}>
        <StyledInput
          type="text"
          {...register(name, {
            pattern: pattern && {
              value: pattern,
              message: 'invalid pattern',
            },
            required: required ? 'required' : false,
          })}
          {...{ disabled, required, width }}
          style={{
            paddingLeft: prefix ? prefix.length + 0.5 + 'em' : '8px',
            borderColor: error ? 'red' : undefined,
          }}
        />
      </StyledDiv>
    </div>
  );
};

export default InputText;
