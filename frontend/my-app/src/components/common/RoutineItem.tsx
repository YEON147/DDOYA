import { Image, ImageSourcePropType, Text, View } from 'react-native';
import { colors } from '@/constants/theme/colors';

type RoutineImage = { id: string; source: ImageSourcePropType };

type RoutineItemProps = {
  title: string;
  images: RoutineImage[];
};

const SLOT_COUNT = 6;

export function RoutineItem({ title, images }: RoutineItemProps) {
  const slots = Array.from({ length: SLOT_COUNT }, (_, index) => images[index] ?? null);

  return (
    <View className="my-8">
      <Text
        className="px-2 text-base font-scdream-bold"
        style={{ color: colors.text }}
      >
        {title}
      </Text>

      <View
        className="relative mt-3 rounded-2xl px-3 pb-3 pt-10"
        style={{
          backgroundColor: '#F5F6F7',
          borderWidth: 1.2,
          borderColor: 'rgba(170, 176, 184, 0.45)',
          shadowColor: '#8D9297',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.16,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View
          className="absolute left-0 right-0 top-0 rounded-t-2xl px-2"
          style={{
            height: 28,
            backgroundColor: 'rgba(235, 238, 242, 0.95)',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(160, 166, 174, 0.5)',
          }}
        >
          <View className="flex-1 flex-row items-center justify-between">
            {[0, 1, 2].map((tab) => (
              <View
                key={`lid-tab-${tab}`}
                className="rounded-sm"
                style={{
                  width: 22,
                  height: 8,
                  backgroundColor: 'rgba(198, 204, 212, 0.9)',
                  borderWidth: 0.7,
                  borderColor: 'rgba(155, 160, 168, 0.6)',
                }}
              />
            ))}
          </View>
        </View>

        <View className="mb-2 h-[2px] rounded-full bg-[#D0D4D9]" />

        <View className="flex-row flex-wrap">
          {slots.map((slot, index) => (
            <View key={slot?.id ?? `empty-${index}`} style={{ width: '33.333%', padding: 4 }}>
              <View
                className="items-center justify-center rounded-md"
                style={{
                  height: 82,
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  borderWidth: 1,
                  borderColor: 'rgba(176, 181, 188, 0.7)',
                }}
              >
                {slot ? (
                  <Image
                    source={slot.source}
                    style={{ width: 56, height: 56, borderRadius: 8 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text
                    className="font-scdream"
                    style={{ color: 'rgba(140, 140, 140, 0.65)' }}
                  >
                    비어 있음
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
