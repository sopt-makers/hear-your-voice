import { style } from '@vanilla-extract/css';
import { colors } from '@sopt-makers/colors';
import { fontsObject } from '@sopt-makers/fonts';

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: 100,
  textAlign: 'center',
});

export const characterImage = style({
  width: '430px',
  height: '276px',
  display: 'block',
});

export const introLine = style({
  margin: 0,
  padding: '20px 28px 0',
  maxWidth: 390,
  whiteSpace: 'pre-line',
  color: colors.white,
  ...fontsObject.HEADING_5_20_B,
});
