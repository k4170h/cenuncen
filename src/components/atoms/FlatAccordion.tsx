import React from 'react';
import styled from '@emotion/styled';
import { ReactNode } from 'react';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import MuiAccordionDetails, {
  AccordionDetailsProps,
} from '@mui/material/AccordionDetails';

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(() => ({
  border: 'none',
  padding: 0,
  margin: 0,
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary {...props} />
))(() => ({
  padding: 0,
  minHeight: 0,
  margin: 0,
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: 0,
  margin: 0,
}));

type Props = {
  children: NonNullable<ReactNode>;
};

export const FlatAccordion = (props: Props & AccordionProps) => (
  <Accordion {...props}>{props.children}</Accordion>
);
export const FlatAccordionSummary = (props: Props & AccordionSummaryProps) => (
  <AccordionSummary {...props}>{props.children}</AccordionSummary>
);
export const FlatAccordionDetails = (props: Props & AccordionDetailsProps) => (
  <AccordionDetails {...props}>{props.children}</AccordionDetails>
);
