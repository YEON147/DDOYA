import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { User } from 'lucide-react-native';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { colors } from '@/constants/theme/colors';
import { useAuthStore } from '@/src/store/authStore';

const line = `${colors.shadowDark}44`;

type InfoRowProps = {
  label: string;
  value: string;
  valueMuted?: boolean;
};

function InfoRow({ label, value, valueMuted }: InfoRowProps) {
  return (
    <View className="flex-row items-start justify-between border-b py-3.5" style={{ borderColor: line }}>
      <Text className="shrink-0 pr-4 text-[14px] font-scdream" style={{ color: colors.textMuted }}>
        {label}
      </Text>
      <Text
        className="flex-1 text-right text-[14px] font-scdream leading-5"
        style={{ color: valueMuted ? colors.textMuted : colors.text }}
        numberOfLines={3}
      >
        {value}
      </Text>
    </View>
  );
}

export default function MyInfoScreen() {
  const nickname = useAuthStore((s) => s.nickname);
  const displayName = nickname?.trim() ? nickname.trim() : '회원';

  // TODO: 이메일은 API 연동 후 스토어/쿼리에서 불러오기
  const emailFromApi: string | null = null;
  const emailDisplay = emailFromApi ?? '준비 중';

  return (
    <ScreenContainer scrollable={false} padding={0} header={<TopHeader title="내 정보" />}>
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center pb-8 pt-2">
          <View
            className="h-[76px] w-[76px] items-center justify-center rounded-full"
            style={{ backgroundColor: colors.surfaceWarm }}
          >
            <User size={34} color={colors.textMuted} strokeWidth={1.75} />
          </View>
          <Text
            className="mt-4 text-center text-[30px] font-scdream-bold tracking-tight"
            style={{ color: colors.text }}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          <Text className="mt-1.5 text-center text-[12px] font-scdream" style={{ color: colors.textMuted }}>
            계정에서 사용 중인 이름이에요
          </Text>
        </View>

        <Text className="mb-1 text-[12px] font-scdream tracking-wide" style={{ color: colors.textMuted }}>
          계정 정보
        </Text>
        <InfoRow label="닉네임" value={displayName} />
        <InfoRow label="이메일" value={emailDisplay} valueMuted={!emailFromApi} />

        <View className="h-10" />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 32,
  },
});
