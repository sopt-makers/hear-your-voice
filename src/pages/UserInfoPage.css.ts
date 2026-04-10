import { style } from '@vanilla-extract/css';
import { colors } from '@sopt-makers/colors';
import { fontsObject } from '@sopt-makers/fonts';

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left',
  color: colors.white,
  ...fontsObject.BODY_3_14_M,
});

export const nameWidth = style({
  width: '50%',
});

export const inputWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 36,
  marginTop: 24,
});
