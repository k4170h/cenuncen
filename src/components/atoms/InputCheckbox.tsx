import styled from '@emotion/styled';
import React, { ReactNode } from 'react';
import { FieldValues, Path, UseFormRegister } from 'react-hook-form';

const StyledCheckbox = styled('input')({
  display: 'none',
  'label:has(&:checked):after': {
    opacity: 1,
  },
});

const StyledLabel = styled('label')({
  boxSizing: 'border-box',
  cursor: 'pointer',
  display: 'inline-block',
  padding: '5px 30px',
  position: 'relative',
  width: 'auto',
  '&:before': {
    background: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    content: '""',
    display: 'block',
    height: '16px',
    left: '5px',
    marginTop: '-8px',
    position: 'absolute',
    top: '50%',
    width: '16px',
  },
  '&:after': {
    borderRight: '6px solid #ab47bc',
    borderBottom: '6px solid #ab47bc',
    content: '""',
    display: 'block',
    height: '14px',
    left: '9px',
    marginTop: '-11px',
    opacity: '0',
    position: 'absolute',
    top: '50%',
    transform: 'rotate(45deg)',
    width: '5px',
  },
});

type Props<T extends FieldValues> = {
  register: UseFormRegister<T>;
  name: Path<T>;
  label?: ReactNode;
  disabled?: boolean;
};

const InputCheckbox = <T extends FieldValues>({
  name,
  register,
  label,
  disabled,
}: Props<T>) => {
  return (
    <>
      <StyledLabel style={{ opacity: disabled ? 0.5 : 1 }}>
        <StyledCheckbox type="checkbox" {...register(name)} {...{ disabled }} />
        {label}
      </StyledLabel>
    </>
  );
};

export default InputCheckbox;
