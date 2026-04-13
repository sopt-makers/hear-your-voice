import { style, globalStyle } from '@vanilla-extract/css';
import { colors } from '@sopt-makers/colors';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  backgroundColor: colors.gray950,
});

export const headerSection = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: 120,
  backgroundColor: colors.secondary,
});

export const headerImage = style({
  maxWidth: '60%',
  maxHeight: '60%',
  objectFit: 'contain',
});

export const contentSection = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  padding: '0 20px',
});

export const contentSectionWithProgress = style({
  paddingTop: 0,
});

export const contentSectionWithoutProgress = style({
  paddingTop: 36,
});

export const buttonSection = style({
  padding: '24px 20px 34px',
});

globalStyle(`${buttonSection} button`, {
  width: '100%',
});
