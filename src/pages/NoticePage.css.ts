import { style } from '@vanilla-extract/css';
import { colors } from '@sopt-makers/colors';
import { fontsObject } from '@sopt-makers/fonts';

export const contentSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  color: colors.white,
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  textAlign: 'left',
  ...fontsObject.BODY_3_14_M,
});

export const indentSection = style({
  paddingLeft: 25,
});

