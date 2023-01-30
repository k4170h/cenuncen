import React, { useEffect } from 'react';
import { DeepRequired, useForm } from 'react-hook-form';
import SectionTitle from '../atoms/SectionTitle';
import { FormUl, FormLi } from '../atoms/FormList';
import { FlatAccordion } from '../atoms/FlatAccordion';
import { EncodeOptions } from '../../utils/types';
import InputCheckbox from '../atoms/InputCheckbox';
import InputRange from '../atoms/InputRange';
import InputColor from '../atoms/InputColor';
import InputText from '../atoms/InputText';
import InputSelect from '../atoms/InputSelect';
import FlexRow from '../atoms/FlexRow';

type Props = {
  onChange: (v: EncodeOptions) => void;
  encodeOptions: EncodeOptions;
};

const EncodeForm = ({ onChange, encodeOptions }: Props) => {
  const {
    watch,
    setValue,
    register,
    trigger,

    formState: { errors, isValid },
  } = useForm<EncodeOptions>({
    defaultValues: encodeOptions,
    mode: 'onChange',
  });
  const doShiftColor = watch('doColorShift');
  const withKey = watch('withKey');
  const shiftColor = watch('shiftColor');
  const fillColor = watch('fillColor');
  const withKeyFlgs = watch(['doSwap', 'doNega', 'doRotate']);

  // Form内容更新時の処理
  useEffect(() => {
    const subscription = watch((values) => {
      // ここでバリデート
      trigger().then((v) => {
        if (v) {
          onChange(values as DeepRequired<EncodeOptions>);
        }
      });
    });

    return () => subscription.unsubscribe();
  }, [watch, onChange, isValid, trigger]);

  useEffect(() => {
    // キーの設定が無意味な時は非活性に
    if (withKeyFlgs.every((v) => !v) && withKey) {
      setValue('withKey', false);
    }
  }, [withKeyFlgs, withKey, setValue]);

  return (
    <>
      <form>
        <SectionTitle>Encode Setting</SectionTitle>
        <FormUl>
          <FormLi>
            <InputCheckbox
              register={register}
              name="doSwap"
              label={<>Shuffle</>}
            />
          </FormLi>
          <FormLi>
            <InputCheckbox
              register={register}
              name="doRotate"
              label={<>Rotate</>}
            />
          </FormLi>
          <FormLi>
            <InputCheckbox
              register={register}
              name="doNega"
              label={<>Negative</>}
            />
          </FormLi>
          <FormLi>
            <InputCheckbox
              register={register}
              name="doColorShift"
              label={<>Contrast</>}
            />
            <FlatAccordion open={doShiftColor} height={100}>
              <InputRange
                register={register}
                name="contrastLevel"
                min={0.1}
                max={0.9}
                step={0.1}
                right={'high'}
                left={'low'}
              />
              <br />

              <FlexRow>
                <InputText
                  register={register}
                  name="shiftColor"
                  prefix="#"
                  error={errors.fillColor}
                  pattern={/^([A-Fa-f0-9]{6})$/}
                />
                <InputColor
                  onChange={(color) => {
                    setValue('shiftColor', color);
                  }}
                  value={shiftColor}
                />
              </FlexRow>
            </FlatAccordion>
          </FormLi>
          <FormLi>
            <InputCheckbox
              register={register}
              name="withKey"
              label={<>Key</>}
              disabled={withKeyFlgs.every((v) => !v)}
            />
            <FlatAccordion open={withKey} height={40}>
              <InputText register={register} name="key" width="8em" />
            </FlatAccordion>
          </FormLi>
          <FormLi>
            <FlexRow>
              <InputText
                register={register}
                name="fillColor"
                prefix="#"
                error={errors.fillColor}
                pattern={/^([A-Fa-f0-9]{6})$/}
              />
              <InputColor
                onChange={(color) => {
                  setValue('fillColor', color);
                }}
                value={fillColor}
              />
            </FlexRow>
          </FormLi>
          <FormLi>
            <div style={{ position: 'relative' }}>
              <p>Location</p>
              <InputSelect
                register={register}
                name="pos"
                items={[
                  {
                    label: 'top',
                    value: 'top',
                  },
                  {
                    label: 'right',
                    value: 'right',
                  },
                  {
                    label: 'bottom',
                    value: 'bottom',
                  },
                  {
                    label: 'left',
                    value: 'left',
                  },
                ]}
              />
            </div>
          </FormLi>
        </FormUl>
      </form>
    </>
  );
};

export default EncodeForm;
