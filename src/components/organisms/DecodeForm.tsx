import React, { useEffect, useRef } from 'react';
import { DeepRequired, useForm } from 'react-hook-form';
import { DEFAULT_DECODE_OPTIONS } from '../../utils/definition';
import { FormLi, FormUl } from '../atoms/FormList';
import { DecodeOptions } from '../../utils/types';
import InputCheckbox from '../atoms/InputCheckbox';
import InputRange from '../atoms/InputRange';
import InputText from '../atoms/InputText';
import SectionTitle from '../atoms/SectionTitle';

type Props = {
  onChange: (v: DecodeOptions) => void;
  decodeOptions?: DecodeOptions;
  disabled?: boolean;
};

const DecodeForm = ({ onChange, decodeOptions, disabled }: Props) => {
  const { register, watch } = useForm<DecodeOptions>({
    defaultValues: decodeOptions,
    mode: 'onChange',
  });

  // Form内容更新時の処理
  useEffect(() => {
    const subscription = watch((values) => {
      onChange(values as DeepRequired<DecodeOptions>);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  return (
    <>
      <SectionTitle>Decode Option</SectionTitle>
      <FormUl>
        <FormLi>
          <InputCheckbox
            register={register}
            name="doCrop"
            label="Clip"
            disabled={disabled}
          />
        </FormLi>
        <FormLi>
          <InputRange
            register={register}
            name="padding"
            min={0}
            max={6}
            step={1}
            disabled={disabled}
            label="Padding"
          />
          <InputRange
            register={register}
            name="offsetX"
            min={-3}
            max={3}
            step={1}
            disabled={disabled}
            label="Offset X"
          />
          <InputRange
            register={register}
            name="offsetY"
            min={-3}
            max={3}
            step={1}
            disabled={disabled}
            label="Offset Y"
          />
        </FormLi>
        <FormLi>
          <InputText
            register={register}
            name="key"
            label="Key"
            width="5em"
            disabled={disabled}
          />
        </FormLi>
      </FormUl>
    </>
  );
};

export default DecodeForm;
