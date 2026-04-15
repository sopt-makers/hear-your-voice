import { style } from '@vanilla-extract/css';
import { colors } from '@sopt-makers/colors';
import { fontsObject } from '@sopt-makers/fonts';

export const pickerBlock = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const sectionTitle = style({
  margin: 0,
  color: colors.white,
  ...fontsObject.TITLE_7_14_SB,
  textAlign: 'left',
});
