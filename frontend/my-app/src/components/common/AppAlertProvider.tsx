import React, { useCallback, useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { colors } from '@/constants/theme/colors';
import { softWellnessCard, neuInset, neuRaised } from '@/constants/theme/neumorphism';
import { registerAppAlert, type AppAlertButton, type AppAlertPayload } from '@/src/utils/appAlert';

type Props = { children: React.ReactNode };

function normalizeButtons(buttons?: AppAlertButton[]): AppAlertButton[] {
  if (buttons && buttons.length > 0) return buttons;
  return [{ text: '확인', style: 'default' as const }];
}

export function AppAlertProvider({ children }: Props) {
  const [payload, setPayload] = useState<AppAlertPayload | null>(null);

  const show = useCallback((p: AppAlertPayload) => {
    setPayload(p);
  }, []);

  useEffect(() => {
    registerAppAlert(show);
    return () => registerAppAlert(null);
  }, [show]);

  const close = useCallback(() => {
    setPayload(null);
  }, []);

  const handleButton = useCallback(
    (btn: AppAlertButton) => {
      const cb = btn.onPress;
      close();
      if (cb) {
        setTimeout(() => {
          try {
            cb();
          } catch (e) {
            console.error('[appAlert] onPress error', e);
          }
        }, 0);
      }
    },
    [close],
  );

  const buttons = payload ? normalizeButtons(payload.buttons) : [];
  const isSingle = buttons.length === 1;

  const renderButton = (btn: AppAlertButton, index: number) => {
    const isCancel = btn.style === 'cancel';
    const isDestructive = btn.style === 'destructive';

    if (isSingle && !isCancel && !isDestructive) {
      return (
        <TouchableOpacity
          key={`${btn.text}-${index}`}
          onPress={() => handleButton(btn)}
          activeOpacity={0.92}
          className="h-14 w-full items-center justify-center rounded-full"
          style={neuRaised(28, colors.point)}
        >
          <Text className="text-lg font-scdream text-white">{btn.text}</Text>
        </TouchableOpacity>
      );
    }

    if (isDestructive) {
      return (
        <TouchableOpacity
          key={`${btn.text}-${index}`}
          onPress={() => handleButton(btn)}
          activeOpacity={0.88}
          className="h-12 flex-1 min-w-[100px] items-center justify-center rounded-2xl px-2"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1.5,
            borderColor: '#EF4444',
          }}
        >
          <Text className="text-center text-[15px] font-scdream-bold" style={{ color: '#DC2626' }}>
            {btn.text}
          </Text>
        </TouchableOpacity>
      );
    }

    if (isCancel) {
      return (
        <TouchableOpacity
          key={`${btn.text}-${index}`}
          onPress={() => handleButton(btn)}
          activeOpacity={0.88}
          className="h-12 flex-1 min-w-[100px] items-center justify-center rounded-2xl px-2"
          style={neuInset(16, colors.input)}
        >
          <Text className="text-center text-[15px] font-scdream-medium" style={{ color: colors.textMuted }}>
            {btn.text}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={`${btn.text}-${index}`}
        onPress={() => handleButton(btn)}
        activeOpacity={0.92}
        className="h-12 flex-1 min-w-[100px] items-center justify-center rounded-2xl px-2"
        style={neuRaised(20, colors.point)}
      >
        <Text className="text-center text-[15px] font-scdream-bold text-white">{btn.text}</Text>
      </TouchableOpacity>
    );
  };

  const onRequestClose = () => {
    if (!payload) return;
    const normalized = normalizeButtons(payload.buttons);
    const cancelBtn = normalized.find((b) => b.style === 'cancel');
    if (cancelBtn) handleButton(cancelBtn);
    else handleButton(normalized[normalized.length - 1]!);
  };

  return (
    <>
      {children}
      <Modal
        visible={!!payload}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={onRequestClose}
      >
        <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: `${colors.brown}55` }}>
          <Pressable style={StyleSheet.absoluteFill} accessible={false} />
          {payload ? (
            <View className="w-full max-w-[320px] px-6 pb-7 pt-8" style={[softWellnessCard(28), { zIndex: 1 }]}>
              <View className="mb-1 h-1 w-10 self-center rounded-full" style={{ backgroundColor: `${colors.primary}55` }} />
              <Text className="mt-3 text-center text-xl font-scdream-bold" style={{ color: colors.brown }}>
                {payload.title}
              </Text>
              {payload.message ? (
                <ScrollView
                  style={{ maxHeight: 220 }}
                  className="mt-3"
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <Text
                    className="text-center text-[15px] leading-[22px] font-scdream"
                    style={{ color: colors.textMuted }}
                  >
                    {payload.message}
                  </Text>
                </ScrollView>
              ) : null}

              <View className={`mt-6 ${isSingle ? '' : 'flex-row flex-wrap justify-center gap-3'}`}>
                {isSingle ? renderButton(buttons[0]!, 0) : buttons.map((b, i) => renderButton(b, i))}
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </>
  );
}
