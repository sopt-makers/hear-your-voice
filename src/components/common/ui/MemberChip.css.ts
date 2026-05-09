import { globalStyle, style } from '@vanilla-extract/css';
import { colors } from '@sopt-makers/colors';
import { fontsObject } from '@sopt-makers/fonts';

export const chipRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 10px 6px 8px',
  borderRadius: '10px',
  backgroundColor: colors.gray900,
});

export const avatar = style({
  width: 28,
  height: 28,
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  backgroundColor: colors.gray700,
  color: colors.gray500,
});

export const chipName = style({
  maxWidth: 140,
  color: colors.white,
  ...fontsObject.BODY_3_14_M,
  textAlign: 'left',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const removeMember = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  width: 16,
  height: 16,
  border: 'none',
  backgroundColor: colors.gray700,
  cursor: 'pointer',
  color: colors.gray300,
  borderRadius: '50px',
  flexShrink: 0,
  selectors: {
    '&:hover': {
      color: colors.white,
    },
  },
});

globalStyle(`${removeMember} svg`, {
  width: 16,
  height: 16,
});
