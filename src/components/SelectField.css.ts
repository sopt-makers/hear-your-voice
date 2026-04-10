import { style, globalStyle } from '@vanilla-extract/css';
import { colors } from '@sopt-makers/colors';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  width: '100%',
});

export const error = style({});

globalStyle(`${error} button > div`, {
  border: `1px solid ${colors.error} !important`,
});
