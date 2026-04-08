import { style } from '@vanilla-extract/css';
import { colors } from '@sopt-makers/colors';

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: '24px 0 12px',
  maxWidth: 320,
  textAlign: 'left',
});

export const fieldLabel = style({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
});

export const codeField = style({
  position: 'relative',
  width: '100%',
});

export const hiddenInput = style({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  opacity: 0,
  cursor: 'text',
  caretColor: 'transparent',
  zIndex: 1,
});

export const codeBoxes = style({
  display: 'flex',
  gap: 12,
  pointerEvents: 'none',
});

export const codeBox = style({
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 42,
  height: 60,
  borderRadius: 8,
  backgroundColor: colors.gray600,
  border: '1px solid transparent',
  selectors: {
    '&[data-filled="true"]': {
      backgroundColor: colors.gray800,
      borderColor: colors.orange400,
    },
    '&[data-active="true"]:not([data-filled="true"])': {
      backgroundColor: colors.gray800,
      borderColor: colors.orange400,
    },
  },
});

export const codeDigit = style({
  display: 'block',
  minHeight: '1em',
  textAlign: 'center',
});

export const errorText = style({
  margin: 0,
  textAlign: 'left',
});
