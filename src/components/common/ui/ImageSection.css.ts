import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
});

export const image = style({
  width: '100%',
  height: 'auto',
  display: 'block',
});
