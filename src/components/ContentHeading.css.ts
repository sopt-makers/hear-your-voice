import { style } from '@vanilla-extract/css';
import { colors } from '@sopt-makers/colors';
import { fontsObject } from '@sopt-makers/fonts';

export const container = style({
  padding: '20px 0 0',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
});

export const title = style({
  margin: 0,
  textAlign: 'left',
  color: colors.white,
  ...fontsObject.HEADING_5_20_B,
});

export const description = style({
  margin: 0,
  width: '100%',
  textAlign: 'left',
  color: colors.white,
  ...fontsObject.TITLE_7_14_SB,
});
