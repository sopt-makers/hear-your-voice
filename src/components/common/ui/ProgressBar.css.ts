import { style } from '@vanilla-extract/css';
import { colors } from '@sopt-makers/colors';

export const container = style({
  width: '100%',
  padding: '10px 20px 36px',
});

export const track = style({
  width: '100%',
  height: 12,
  borderRadius: 12,
  overflow: 'hidden',
  backgroundColor: colors.white,
});

export const fill = style({
  height: '100%',
  borderRadius: 12,
  backgroundColor: colors.orange400,
});
