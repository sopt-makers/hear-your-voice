import { style } from '@vanilla-extract/css';
import { colors } from '@sopt-makers/colors';
import { fontsObject } from '@sopt-makers/fonts';

export const fieldGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const searchContainer = style({
  position: 'relative',
  marginTop: 4,
});

export const inputWrapper = style({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: colors.gray800,
  borderRadius: 6,
  padding: '12px 14px',
  gap: 8,
});

export const searchInput = style({
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: colors.white,
  ...fontsObject.BODY_3_14_M,
  selectors: {
    '&::placeholder': {
      color: colors.gray400,
    },
  },
});

export const clearButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  flexShrink: 0,
});

export const dropdown = style({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  backgroundColor: colors.gray800,
  borderRadius: 6,
  marginTop: 4,
  zIndex: 10,
  overflow: 'hidden',
  listStyle: 'none',
  padding: 0,
});

export const dropdownItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  padding: '10px 14px',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  color: colors.white,
  ...fontsObject.BODY_3_14_M,
  textAlign: 'left',
  selectors: {
    '&:hover': {
      backgroundColor: colors.gray700,
    },
  },
});

export const avatarIcon = style({
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

export const chipWrapper = style({
  marginTop: 4,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

export const clearIcon = style({
  width: 20,
  height: 20,
  color: colors.gray50,
});

export const avatarIconSvg = style({
  width: 20,
  height: 20,
});
