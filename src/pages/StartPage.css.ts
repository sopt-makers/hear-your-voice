import { style } from '@vanilla-extract/css';
import { colors } from '@sopt-makers/colors';
import { fontsObject } from '@sopt-makers/fonts';

export const backgroundImage = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export const mainContent = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 20,
  zIndex: 5,
});

export const titleImage = style({
  width: 280,
  height: 'auto',
});

export const overlay = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 21,
  padding: 20,
  zIndex: 20,
  backgroundColor: colors.backgroundDimmed,
});

export const disableContent = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  maxWidth: 350,
});

export const disableTitle = style({
  textAlign: 'center',
  margin: 0,
  color: colors.white,
  ...fontsObject.HEADING_4_24_B,
});

export const disableDescription = style({
  textAlign: 'center',
  margin: 0,
  color: colors.white,
  ...fontsObject.BODY_2_16_M,
});
