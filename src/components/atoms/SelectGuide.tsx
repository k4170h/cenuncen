import React from 'react';
import styled from '@emotion/styled';

const StyledBox = styled('div')({
  position: 'absolute',
  backgroundImage: 'url(areaSelect.svg)',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '40%',
  backgroundPosition: '50% 50%',
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  top: 0,
  left: 0,
});

const SelectGuilde = () => {
  return <StyledBox />;
};

export default SelectGuilde;
