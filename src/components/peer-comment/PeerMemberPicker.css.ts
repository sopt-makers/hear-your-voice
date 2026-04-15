import { globalStyle, style } from '@vanilla-extract/css';
import { colors } from '@sopt-makers/colors';
import { fontsObject } from '@sopt-makers/fonts';

export const pickerRoot = style({});

globalStyle(`${pickerRoot} button:disabled`, {
  opacity: 0.5,
  cursor: 'not-allowed',
  color: `${colors.gray400} !important`,
});

export const chipList = style({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 8,
});

export const pickerTriggerButton = style({
  backgroundColor: `${colors.gray600} !important`,
});

export const sheetDialogSurface = style({
  width: '100%',
  overflow: 'hidden',
});

globalStyle(`body > div:has(.${sheetDialogSurface})`, {
  width: 'min(386px, calc(100vw - 44px))',
  maxWidth: 'min(386px, calc(100vw - 44px))',
  margin: '0 auto',
  padding: '12px 0 12px',
  borderRadius: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: colors.gray900,
});

export const sheetBody = style({
  width: '100%',
  padding: '0 16px',
  maxHeight: '44vh',
  overflowY: 'auto',
  msOverflowStyle: 'none',
  scrollbarWidth: 'none',
});

export const sheetMemberButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '12px 16px',
  border: 'none',
  background: 'transparent',
  color: colors.white,
  cursor: 'pointer',
  textAlign: 'left',
  ...fontsObject.BODY_2_16_M,
  selectors: {
    '&:hover': {
      backgroundColor: colors.gray800,
    },
  },
});

export const memberName = style({
  ...fontsObject.BODY_2_16_M,
});

export const memberAvatar = style({
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  backgroundColor: colors.gray800,
  color: colors.gray200,
});

globalStyle(`${memberAvatar} svg`, {
  width: 20,
  height: 20,
});

export const sheetHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '14px 16px 12px',
  color: colors.white,
  ...fontsObject.TITLE_4_20_SB,
});

export const sheetBackButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'transparent',
  color: colors.white,
  padding: 0,
  cursor: 'pointer',
});

export const sheetEmpty = style({
  padding: 24,
  color: colors.gray400,
  textAlign: 'center',
  ...fontsObject.BODY_2_16_M,
});

export const sheetConfirmArea = style({
  padding: '16px 16px 8px',
});

export const sheetConfirmButton = style({
  width: '100%',
});

export const memberCheckSelected = style({
  marginLeft: 'auto',
  width: 24,
  height: 24,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  color: colors.success,
  ...fontsObject.LABEL_3_14_SB,
});

globalStyle(`${sheetBody}::-webkit-scrollbar`, {
  display: 'none',
});
