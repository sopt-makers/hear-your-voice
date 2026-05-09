import { style } from '@vanilla-extract/css';

export const repeaterRoot = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
});

export const list = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
});

export const addRow = style({
  padding: '16px 0 0',
  alignSelf: 'center',
});
