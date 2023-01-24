import React from 'react';
import { ReactNode } from 'react';
import { Typography } from '@mui/material';

type Props = {
  children: ReactNode;
};
const FormTitle = ({ children }: Props) => {
  return (
    <Typography fontSize={'1.2em'} component="h3" color="#333">
      {children}
    </Typography>
  );
};

export default FormTitle;
