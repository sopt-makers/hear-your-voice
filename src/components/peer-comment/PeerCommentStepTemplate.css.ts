import { style } from '@vanilla-extract/css';
import { colors } from '@sopt-makers/colors';
import { fontsObject } from '@sopt-makers/fonts';

export const stepContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  width: '100%',
});

export const noticeText = style({
  margin: 0,
  color: colors.white,
  ...fontsObject.BODY_3_14_M,
});
