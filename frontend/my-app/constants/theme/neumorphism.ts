import { Platform, type ViewStyle } from 'react-native';
import { colors } from './colors';

/** 볼록 — `TouchableOpacity` / `Pressable`의 `style`에 직접 넣는 용도(터치 가림 방지) */
export function neuRaised(radius: number, fill: string = colors.surface): ViewStyle {
  const base: ViewStyle = {
    backgroundColor: fill,
    borderRadius: radius,
  };

  if (Platform.OS === 'web') {
    return {
      ...base,
      // 웹 그림자를 네이티브(iOS/Android) 체감과 비슷한 강도로 축소
      boxShadow: `3px 3px 8px ${colors.shadowDark}A6, -2px -2px 6px ${colors.shadowLight}E6`,
    } as ViewStyle;
  }

  return {
    ...base,
    ...Platform.select<ViewStyle>({
      ios: {
        shadowColor: colors.shadowDark,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
        shadowColor: colors.shadowDark,
        borderWidth: 1,
        borderColor: `${colors.shadowLight}CC`,
      },
      default: {},
    }),
  };
}

/** 홈 핵심 카드 — 아이보리 + 아주 약한 그림자 (Soft Wellness) */
export function softWellnessCard(radius: number = 20): ViewStyle {
  const base: ViewStyle = {
    backgroundColor: colors.cardIvory,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: `${colors.shadowDark}18`,
  };

  if (Platform.OS === 'web') {
    return {
      ...base,
      boxShadow: `0 2px 14px ${colors.shadowDark}18`,
    } as ViewStyle;
  }

  return {
    ...base,
    ...Platform.select<ViewStyle>({
      ios: {
        shadowColor: colors.shadowDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  };
}

/** 오목 — 입력 필드 등 */
export function neuInset(radius: number, fill: string = colors.input): ViewStyle {
  const base: ViewStyle = {
    backgroundColor: fill,
    borderRadius: radius,
  };

  if (Platform.OS === 'web') {
    return {
      ...base,
      boxShadow: `inset 2px 2px 4px ${colors.shadowDark}73, inset -1px -1px 3px ${colors.shadowLight}E6`,
      border: `1px solid ${colors.shadowDark}40`,
    } as ViewStyle;
  }

  return {
    ...base,
    borderWidth: 1,
    borderColor: `${colors.shadowDark}52`,
  };
}
