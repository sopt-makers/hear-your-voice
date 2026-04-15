import { style } from '@vanilla-extract/css';
import { colors } from '@sopt-makers/colors';

export const card = style({
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 12,
  padding: '8px 0 20px',
  border: `1px solid ${colors.gray600}`,
  width: '100%',
  alignSelf: 'stretch',
});

export const cardHeader = style({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: '0 12px 0',
});

export const trashButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  width: 36,
  height: 36,
  border: 'none',
  borderRadius: 8,
  background: 'transparent',
  cursor: 'pointer',
  color: colors.gray400,
  selectors: {
    '&:hover': {
      color: colors.white,
      backgroundColor: colors.gray800,
    },
  },
});

export const commentSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  paddingLeft: 20,
  paddingRight: 20,
});
