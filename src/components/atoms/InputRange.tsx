import styled from '@emotion/styled';
import React, { ReactNode, useCallback, useRef, useState } from 'react';
import { FieldValues, Path, UseFormRegister } from 'react-hook-form';
import FlexCol from './FlexCol';
import FlexRow from './FlexRow';

const StyledRange = styled('input')({
  appearance: 'none',
  cursor: 'pointer',
  outline: 'none',
  height: '6px',
  width: '100%',
  background: '#ccc',
  borderRadius: '4px',
  border: 'solid 1px #ccc',
  '&::-webkit-slider-thumb': {
    webkitAppearance: 'none',
    appearance: 'none',
    background: '#ab47bc',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    boxShadow: '0 1px 3px 0px rgba(0,0,0,.2)',
  },
  '&::-moz-range-thumb': {
    background: '#53aeff',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    boxShadow: '0 1px 3px 0px rgba(0,0,0,.2)',
    border: 'none',
  },
  '&::-moz-focus-outer': {
    border: 0,
  },
  '&:active::-webkit-slider-thumb': {
    boxShadow: '0px 5px 10px -2px rgba(0, 0, 0, 0.3)',
  },
  '&:disabled::-webkit-slider-thumb': {
    background: '#aaa',
  },
});

type Props<T extends FieldValues> = {
  register: UseFormRegister<T>;
  name: Path<T>;
  label?: ReactNode;
  min: number;
  max: number;
  step: number;
  left?: ReactNode;
  right?: ReactNode;
  width?: string;
  pattern?: RegExp;
  required?: boolean;
  disabled?: boolean;
};

const InputRange = <T extends FieldValues>({
  name,
  register,
  label,
  min,
  max,
  step,
  required,
  disabled,
  left,
  right,
}: Props<T>) => {
  const lastValue = useRef(0);
  const field = register(name, { valueAsNumber: true });
  const [viewValue, setViewValue] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      setViewValue(true);
    },
    [setViewValue]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      setViewValue(false);
    },
    [setViewValue]
  );

  return (
    <div style={{ position: 'relative' }}>
      {viewValue && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: -10,
            borderRadius: '5px',
            padding: '4px 16px',
            textAlign: 'center',
            backgroundColor: '#ab47bc',
            color: '#fff',
          }}
        >
          {lastValue.current}
        </div>
      )}
      <FlexCol>
        <label style={{ opacity: disabled ? 0.5 : 1 }}>{label}</label>
        <FlexRow>
          <div style={{ opacity: disabled ? 0.5 : undefined }}>{left}</div>
          <StyledRange
            type="range"
            {...field}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (lastValue.current !== value) {
                lastValue.current = value;
                field.onChange(e);
              }
            }}
            {...{ disabled, required, min, max, step }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          />
          <div style={{ opacity: disabled ? 0.5 : undefined }}>{right}</div>
        </FlexRow>
      </FlexCol>
    </div>
  );
};

export default InputRange;
