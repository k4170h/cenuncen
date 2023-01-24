import React from 'react';
import { Stack, Typography } from '@mui/material';
import ClipboardImageLoader from './ClipboardImageLoader';
import ImageFileLoader from './ImageFileLoader';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { Box } from '@mui/system';
import FormTitle from '../atoms/FormTitle';

type Props = {
  onImageLoaded: (imageData: ImageData) => void;
};

const SmallImageLoader = ({ onImageLoaded }: Props) => {
  return (
    <Stack>
      <FormTitle>Open image</FormTitle>
      <Stack direction="row" spacing={2}>
        <Stack width={'100%'}>
          <ImageFileLoader onImageLoaded={onImageLoaded}>
            <FolderOpenIcon />
          </ImageFileLoader>
        </Stack>
        <Stack width={'100%'}>
          <ClipboardImageLoader onImageLoaded={onImageLoaded}>
            <ContentPasteIcon />
          </ClipboardImageLoader>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default SmallImageLoader;
