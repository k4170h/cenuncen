import React, { ReactNode } from 'react';
import { FieldValues, Path, UseFormRegister } from 'react-hook-form';

export type Item<T> = {
  value: T;
  label: ReactNode;
};

type Props<T extends FieldValues, U> = {
  register: UseFormRegister<T>;
  name: Path<T>;
  items: Item<U>[];
  label?: ReactNode;
  disabled?: boolean;
};

const InputSelect = <T extends FieldValues, U extends string | number>({
  name,
  register,
  items,
  label,
  disabled,
}: Props<T, U>) => {
  return (
    <>
      <label htmlFor={name}>{label}</label>
      <select {...register(name)} disabled={disabled}>
        {items.map((v) => (
          <option value={v.value} key={v.value}>
            {v.label}
          </option>
        ))}
      </select>
    </>
  );
};

export default InputSelect;
