import { Box, Stack, Typography } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import ControlledTextarea from '../atoms/ControlledTextarea';
import { DEFAULT_ENCODE_OPTIONS } from '../../utils/definition';
import ControlledColorPicker from '../atoms/ControlledColorPicker';
import ControlledSlider from '../atoms/ControlledSlider';
import ContrastOutlinedIcon from '@mui/icons-material/ContrastOutlined';
import CircleTwoToneIcon from '@mui/icons-material/CircleTwoTone';
import ControlledSwitch from '../atoms/ControlledSwitch';
import ControlledRadioPos from '../atoms/ControlledRadioPos';
import FormTitle from '../atoms/FormTitle';
import { FormUl, FormLi } from '../atoms/FormList';
import {
  FlatAccordion,
  FlatAccordionDetails,
  FlatAccordionSummary,
} from '../atoms/FlatAccordion';

type Props = {
  onChange?: (v: typeof DEFAULT_ENCODE_OPTIONS) => void;
  encodeOptions: typeof DEFAULT_ENCODE_OPTIONS;
};

const EncodeForm = ({ onChange, encodeOptions }: Props) => {
  const { control, watch } = useForm<typeof DEFAULT_ENCODE_OPTIONS>({
    defaultValues: encodeOptions,
    mode: 'onChange',
  });
  const watchForm = watch();
  const doShiftColor = watch('doColorShift');
  const withKey = watch('withKey');
  const lastValue = useRef('');

  useEffect(() => {
    const watchFormStr = JSON.stringify(watchForm);
    if (lastValue.current !== watchFormStr) {
      lastValue.current = watchFormStr;
      onChange && onChange(watchForm);
    }
  }, [watchForm, onChange]);

  return (
    <>
      <form>
        <FormTitle>Encode Setting</FormTitle>
        <FormUl>
          <FormLi>
            <ControlledSwitch
              control={control}
              name="doSwap"
              label={<>Shuffle</>}
            />
          </FormLi>
          <FormLi>
            <ControlledSwitch
              control={control}
              name="doRotate"
              label={<>Rotate</>}
            />
          </FormLi>
          <FormLi>
            <ControlledSwitch
              control={control}
              name="doNega"
              label={<>Negative</>}
            />
          </FormLi>
          <FormLi>
            <FlatAccordion expanded={doShiftColor}>
              <FlatAccordionSummary>
                <ControlledSwitch
                  control={control}
                  name="doColorShift"
                  label={<>Contrast</>}
                />
              </FlatAccordionSummary>
              <FlatAccordionDetails>
                <Stack spacing={2} px={1} my={2}>
                  <ControlledSlider
                    control={control}
                    name="contrastLevel"
                    min={0.1}
                    max={0.9}
                    step={0.1}
                    right={<ContrastOutlinedIcon />}
                    left={<CircleTwoToneIcon />}
                  />
                  <ControlledColorPicker
                    label="Color"
                    control={control}
                    name="shiftColor"
                  />
                </Stack>
              </FlatAccordionDetails>
            </FlatAccordion>
          </FormLi>
          <FormLi>
            <FlatAccordion expanded={withKey}>
              <FlatAccordionSummary>
                <ControlledSwitch
                  control={control}
                  name="withKey"
                  label={<>Key</>}
                />
              </FlatAccordionSummary>
              <FlatAccordionDetails>
                <Stack px={1} my={2}>
                  <ControlledTextarea
                    control={control}
                    name="key"
                    label="key"
                    type="text"
                    width="8em"
                  />
                </Stack>
              </FlatAccordionDetails>
            </FlatAccordion>
          </FormLi>
          <FormLi>
            <ControlledColorPicker
              label="Fill Color"
              control={control}
              name="fillColor"
            />
          </FormLi>
          <FormLi>
            <Box position={'relative'}>
              <Typography position={'absolute'}>Location</Typography>
              <ControlledRadioPos control={control} name="pos" />
            </Box>
          </FormLi>
        </FormUl>
      </form>
    </>
  );
};

export default EncodeForm;
