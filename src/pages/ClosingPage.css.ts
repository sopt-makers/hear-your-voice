import { style, globalStyle } from '@vanilla-extract/css';
import { colors } from '@sopt-makers/colors';
import { fontsObject } from '@sopt-makers/fonts';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: colors.gray950,
});

export const banner = style({
  width: '100%',
  height: 150,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: colors.secondary,
});

export const bannerImage = style({
  maxWidth: '60%',
  maxHeight: '60%',
  objectFit: 'contain',
});

export const progressSection = style({
  height: 44,
  flexShrink: 0,
});

globalStyle(`${progressSection} > div`, {
  padding: '16px 20px',
});

export const content = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

export const imageArea = style({
  marginTop: 56,
  width: '100%',
  height: 276,
  objectFit: 'contain',
});

export const textArea = style({
  width: '100%',
  height: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const textContent = style({
  padding: '20px 28px',
  color: colors.white,
  textAlign: 'center',
  ...fontsObject.HEADING_5_20_B,
});

export const buttonSection = style({
  padding: '0 20px 34px',
  flexShrink: 0,
});

globalStyle(`${buttonSection} button`, {
  width: '100%',
  borderRadius: '12px !important',
});
