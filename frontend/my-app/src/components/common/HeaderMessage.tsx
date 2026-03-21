import { View, Text } from 'react-native';
import { colors } from '@/constants/theme/colors';
import { useAuthStore } from '@/src/store/authStore';

type NicknameHeaderProps = {
  message?: string;
  /** 마이페이지 와이어: 부제만 연한 톤·한 단계 작은 크기 */
  messageTone?: 'default' | 'subtle';
};

export function NicknameHeader({
  message = '오늘도 건강한 하루보내세요!',
  messageTone = 'default',
}: NicknameHeaderProps) {
  const { nickname } = useAuthStore();

  return (
    <View className="mt-1 mb-2 p-3">
      <View>
        <Text
          className="mb-2 text-[26px] font-scdream-medium leading-[32px]"
          style={{ color: colors.text }}
        >
          {nickname || '회원'}님
        </Text>
        <Text
          className={
            messageTone === 'subtle' ? 'text-[14px] font-scdream leading-5' : 'text-[17px] font-scdream-medium leading-6'
          }
          style={{ color: messageTone === 'subtle' ? colors.textMuted : colors.text }}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}
