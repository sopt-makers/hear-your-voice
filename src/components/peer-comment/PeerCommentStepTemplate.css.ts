import { globalStyle, style } from '@vanilla-extract/css';
import { colors } from '@sopt-makers/colors';
import { fontsObject } from '@sopt-makers/fonts';

/** 제목 블록 ↔ 이미지 ↔ 코멘트 반복 영역 사이 16px */
export const stepContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  width: '100%',
});

/**
 * ContentHeading + 페이지별 안내 문단( children )
 * 제목/설명과 그 아래 문단 사이 간격 없음
 */
export const headingBlock = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  width: '100%',
});

globalStyle(`${headingBlock} p`, {
  margin: 0,
  marginTop: 0,
  textAlign: 'left',
  color: colors.white,
  ...fontsObject.BODY_3_14_M,
});
