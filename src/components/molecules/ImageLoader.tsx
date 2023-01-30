import React from 'react';
import ClipboardImageLoader from './ClipboardImageLoader';
import ImageFileLoader from './ImageFileLoader';
import FlexBox from '../atoms/FlexRow';
import SectionTitle from '../atoms/SectionTitle';

type Props = {
  onImageLoaded: (imageData: ImageData) => void;
};

const ImageLoader = ({ onImageLoaded }: Props) => {
  return (
    <>
      <SectionTitle>Open image</SectionTitle>
      <FlexBox>
        <ImageFileLoader onImageLoaded={onImageLoaded}>
          local file
        </ImageFileLoader>
        <ClipboardImageLoader onImageLoaded={onImageLoaded}>
          clipboard
        </ClipboardImageLoader>
      </FlexBox>
    </>
  );
};

export default ImageLoader;