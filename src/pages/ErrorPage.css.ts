import { style } from '@vanilla-extract/css';
import { colors } from '@sopt-makers/colors';
import { fontsObject } from '@sopt-makers/fonts';

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
  justifyContent: 'center',
  textAlign: 'center',
});

export const characterImage = style({
  width: '148px',
  height: '120px',
  display: 'block',
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  marginTop: 24,
});

const textBase = {
  margin: 0,
  maxWidth: 390,
  whiteSpace: 'pre-line' as const,
  color: colors.white,
};

export const title = style({
  ...textBase,
  color: colors.white,
  ...fontsObject.HEADING_5_20_B,
});

export const description = style({
  ...textBase,
  color: colors.white,
  ...fontsObject.BODY_2_16_R,
});
