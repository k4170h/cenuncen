import React, { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import { HexColorPicker } from 'react-colorful';

const Popover = styled('div')({
  position: 'absolute',
  top: 'calc(100% + 2px)',
  right: 0,
  borderRadius: '9px',
});

const Cover = styled('div')({
  position: 'fixed',
  top: '0px',
  right: '0px',
  bottom: '0px',
  left: '0px',
  zIndex: 100,
});

const PickerWrapper = styled('div')({
  backgroundColor: '#fff',
  position: 'fixed',
  zIndex: 200,
  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
  right: '40px',
});

const ColoringButton = styled('button')({
  border: 'none',
  borderRadius: '2px',
  width: '2em',
  height: '1em',
  position: 'relative',
});

type Props = {
  onChange: (color: string) => void;
  value: string;
};

const InputColor = ({ onChange, value }: Props) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [color, setColor] = useState('');
  const toggle = useCallback(() => {
    setDisplayColorPicker(!displayColorPicker);
  }, [displayColorPicker]);

  const close = useCallback(() => {
    setDisplayColorPicker(false);
  }, []);

  return (
    <>
      <div style={{ position: 'relative' }}>
        <ColoringButton
          type="button"
          onClick={toggle}
          style={{
            backgroundColor: `#${value}`,
          }}
        >
          <></>
        </ColoringButton>
        {displayColorPicker && (
          <Popover>
            <PickerWrapper className="custom">
              <HexColorPicker
                color={value}
                onChange={(c) => {
                  setColor(c.slice(1));
                }}
              />
              <button
                onClick={() => {
                  onChange(color);
                  close();
                }}
                style={{
                  width: '100%',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
              >
                OK
              </button>
            </PickerWrapper>
            <Cover
              onClick={() => {
                onChange(color);
                close();
              }}
            />
          </Popover>
        )}
      </div>
    </>
  );
};

export default InputColor;
