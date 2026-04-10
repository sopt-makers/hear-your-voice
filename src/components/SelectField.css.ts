import { style } from '@vanilla-extract/css';
import { colors } from '@sopt-makers/colors';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  width: '100%',
});

export const errorTrigger = style({
  border: `1px solid ${colors.error}`,
});
