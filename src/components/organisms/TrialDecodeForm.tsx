import { Button, Stack, Typography } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { DEFAULT_TRIAL_DECODE_OPTIONS } from '../../utils/definition';
import ControlledSwitch from '../atoms/ControlledSwitch';
import ControlledSlider from '../atoms/ControlledSlider';
import FormTitle from '../atoms/FormTitle';
import { FormLi, FormUl } from '../atoms/FormList';
import {
  FlatAccordion,
  FlatAccordionDetails,
  FlatAccordionSummary,
} from '../atoms/FlatAccordion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type Props = {
  onChange?: (v: typeof DEFAULT_TRIAL_DECODE_OPTIONS) => void;
  onSubmit?: (v: typeof DEFAULT_TRIAL_DECODE_OPTIONS) => void;
  trialDecodeOptions?: typeof DEFAULT_TRIAL_DECODE_OPTIONS;
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
  const { control, watch, handleSubmit } = useForm<
    typeof DEFAULT_TRIAL_DECODE_OPTIONS
  >({
    defaultValues: trialDecodeOptions,
    mode: 'onChange',
  });
  const watchForm = watch();
  const scale = watch('scale');
  const lastFormValue = useRef(JSON.stringify(DEFAULT_TRIAL_DECODE_OPTIONS));

  useEffect(() => {
    const watchFormStr = JSON.stringify(watchForm);
    if (lastFormValue.current !== watchFormStr) {
      lastFormValue.current = watchFormStr;
      onChange && onChange(watchForm);
    }
  }, [onChange, watchForm]);

  return (
    <FlatAccordion defaultExpanded={expanded}>
      <FlatAccordionSummary expandIcon={<ExpandMoreIcon />}>
        <FormTitle>Try Decode</FormTitle>
      </FlatAccordionSummary>
      <FlatAccordionDetails>
        <form onSubmit={handleSubmit(onSubmit ?? (() => null))}>
          <FormUl>
            <FormLi>
              <ControlledSwitch
                control={control}
                name="isJPG"
                label={<>Convert to JPG</>}
                disabled={disabled}
              />
            </FormLi>
            <FormLi>
              <Stack spacing={-1}>
                Resize
                <ControlledSlider
                  control={control}
                  name={'scale'}
                  max={100}
                  min={1}
                  step={1}
                  disabled={disabled}
                  valueLabelFormat={(v) => `${v}%`}
                />
                <Stack direction={'row'} spacing={2} justifyContent="center">
                  <Typography>
                    {Math.round((imageSize[0] * scale) / 100)}
                  </Typography>
                  <Typography>X</Typography>
                  <Typography>
                    {Math.round((imageSize[1] * scale) / 100)}
                  </Typography>
                </Stack>
              </Stack>
            </FormLi>
          </FormUl>
          <Button type="submit" variant="contained" disabled={disabled}>
            Decode
          </Button>
        </form>
      </FlatAccordionDetails>
    </FlatAccordion>
  );
};

export default TrialDecodeForm;
