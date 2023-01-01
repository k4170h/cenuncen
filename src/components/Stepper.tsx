import styled from '@emotion/styled';
import { Button } from '@mui/material';
import { Box } from '@mui/system';
import React, { useCallback } from 'react';
import { scroller } from 'react-scroll';
import InputIcon from '@mui/icons-material/Input';
import CropFreeIcon from '@mui/icons-material/CropFree';
import TuneIcon from '@mui/icons-material/Tune';
import OutputIcon from '@mui/icons-material/Output';

const StyledBox = styled(Box)({
  position: 'fixed',
  left: 0,
  top: '50%',
  backgroundColor: '#fff',
  zIndex: 900,
  boxShadow: '0 1px 3px 0px rgba(0,0,0,.2)',
  borderRadius: '0 8px 8px 0 ',
});

const Ul = styled('ul')({
  padding: 0,
  margin: 0,
});

const Li = styled('li')({
  padding: 0,
  margin: 0,
  listStyle: 'none',
});

const Stepper = () => {
  const scroll = useCallback((to: string) => {
    scroller.scrollTo(to, {
      duration: 400,
      delay: 0,
      smooth: 'easeInOutQuart',
      offset: -60,
    });
  }, []);
  return (
    <StyledBox>
      <Ul>
        <Li>
          <Button
            onClick={() => {
              scroll('step1');
            }}
          >
            <InputIcon />
          </Button>
        </Li>
        <Li>
          <Button
            onClick={() => {
              scroll('step2');
            }}
          >
            <CropFreeIcon />
          </Button>
        </Li>
        <Li>
          <Button
            onClick={() => {
              scroll('step3');
            }}
          >
            <TuneIcon />
          </Button>
        </Li>
        <Li>
          <Button
            onClick={() => {
              scroll('step4');
            }}
          >
            <OutputIcon />
          </Button>
        </Li>
      </Ul>
    </StyledBox>
  );
};

export default Stepper;
