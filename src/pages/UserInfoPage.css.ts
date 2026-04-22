import { style } from '@vanilla-extract/css';
import { colors } from '@sopt-makers/colors';
import { fontsObject } from '@sopt-makers/fonts';

export const noticeText = style({
  margin: 0,
  textAlign: 'left',
  color: colors.white,
  ...fontsObject.BODY_3_14_M,
});

export const nameWidth = style({
  width: '50%',
});
