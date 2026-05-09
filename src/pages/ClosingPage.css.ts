import { style } from '@vanilla-extract/css';
import { colors } from '@sopt-makers/colors';
import { fontsObject } from '@sopt-makers/fonts';

export const imageArea = style({
  marginTop: 56,
  width: '100%',
  height: 276,
  objectFit: 'contain',
});

export const textArea = style({
  width: '100%',
  height: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const textContent = style({
  padding: '20px 28px',
  color: colors.white,
  textAlign: 'center',
  ...fontsObject.HEADING_5_20_B,
});
