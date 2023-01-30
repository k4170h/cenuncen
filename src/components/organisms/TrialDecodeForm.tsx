import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { DEFAULT_TRIAL_DECODE_OPTIONS } from '../../utils/definition';
import SectionTitle from '../atoms/SectionTitle';
import { FormLi, FormUl } from '../atoms/FormList';
import { FlatAccordion } from '../atoms/FlatAccordion';
import { TrialDecodeOptions } from '../../utils/types';
import CenteringBox from '../atoms/CenteringBox';
import Button from '../atoms/Button';
import InputCheckbox from '../atoms/InputCheckbox';
import InputRange from '../atoms/InputRange';

type Props = {
  onChange?: (v: TrialDecodeOptions) => void;
  onSubmit?: (v: TrialDecodeOptions) => void;
  trialDecodeOptions?: TrialDecodeOptions;
  disabled?: boolean;
  imageSize: [number, number];
  expanded?: boolean;
};

const TrialDecodeForm = ({
  onChange,
  trialDecodeOptions,
  disabled,
  imageSize,
  onSubmit,
  expanded,
}: Props) => {
  const { register, watch, handleSubmit } = useForm<TrialDecodeOptions>({
    defaultValues: trialDecodeOptions,
    mode: 'onChange',
  });
  const watchForm = watch();
  const scale = watch('scale');
  const lastFormValue = useRef(JSON.stringify(DEFAULT_TRIAL_DECODE_OPTIONS));
  const [display, setDisplay] = useState(false);

  useEffect(() => {
    const watchFormStr = JSON.stringify(watchForm);
    if (lastFormValue.current !== watchFormStr) {
      lastFormValue.current = watchFormStr;
      onChange && onChange(watchForm);
    }
  }, [onChange, watchForm]);

  return (
    <>
      <SectionTitle>
        <div
          onClick={() => {
            setDisplay(!display);
          }}
        >
          Try Decode
        </div>
      </SectionTitle>
      <form onSubmit={handleSubmit(onSubmit ?? (() => null))}>
        <FormUl>
          <FormLi>
            <InputCheckbox
              register={register}
              name="isJPG"
              label={<>Convert to JPG</>}
              disabled={disabled}
            />
          </FormLi>
          <FormLi>
            <div>
              Resize
              <InputRange
                register={register}
                name={'scale'}
                max={100}
                min={1}
                step={1}
                disabled={disabled}
              />
              <CenteringBox>
                {Math.round((imageSize[0] * scale) / 100)}X
                {Math.round((imageSize[1] * scale) / 100)}
              </CenteringBox>
            </div>
          </FormLi>
        </FormUl>
        <Button type="submit" disabled={disabled}>
          <>Decode &gt;</>
        </Button>
      </form>
    </>
  );
};

export default TrialDecodeForm;
