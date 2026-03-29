import React, { useCallback, useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { colors } from '@/constants/theme/colors';
import { softWellnessCard, neuInset, neuRaised } from '@/constants/theme/neumorphism';
import { registerAppAlert, type AppAlertButton, type AppAlertPayload } from '@/src/utils/appAlert';

type Props = { children: React.ReactNode };

function normalizeButtons(buttons: AppAlertButton[] | undefined, autoDismissMs?: number): AppAlertButton[] {
  if (autoDismissMs != null && autoDismissMs > 0) return [];
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

  useEffect(() => {
    if (!payload?.autoDismissMs || payload.autoDismissMs <= 0) return;
    const id = setTimeout(close, payload.autoDismissMs);
    return () => clearTimeout(id);
  }, [payload, close]);

  const handleButton = useCallback(
    (btn: AppAlertButton) => {
      const cb = btn.onPress;
      close();
      if (cb) {
        setTimeout(() => {
          try {
            cb();
          } catch {
            // 콜백 내부 오류는 삼킴 (알럿은 이미 닫힘)
          }
        }, 0);
      }
    },
    [close],
  );

  const buttons = payload ? normalizeButtons(payload.buttons, payload.autoDismissMs) : [];
  const isSingle = buttons.length === 1;
  const showTitle = !!(payload?.title && payload.title.trim());

  const renderButton = (btn: AppAlertButton, index: number) => {
    const isCancel = btn.style === 'cancel';
    const isDestructive = btn.style === 'destructive';

    if (isSingle && !isCancel && !isDestructive) {
      return (
        <TouchableOpacity
          key={`${btn.text}-${index}`}
          onPress={() => handleButton(btn)}
          activeOpacity={0.92}
          className="h-12 w-full items-center justify-center rounded-full"
          style={neuRaised(24, colors.point)}
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
    const normalized = normalizeButtons(payload.buttons, payload.autoDismissMs);
    if (normalized.length === 0) {
      close();
      return;
    }
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
        <View
          className="flex-1 items-center justify-center px-4"
          style={{ backgroundColor: `${colors.brown}38` }}
        >
          <Pressable style={StyleSheet.absoluteFill} accessible={false} />
          {payload ? (
            <View
              className="w-full max-w-[300px] px-4 pb-5 pt-5"
              style={[softWellnessCard(24), { zIndex: 1, backgroundColor: `${colors.cardIvory}E8` }]}
            >
              <View className="mb-0.5 h-1 w-9 self-center rounded-full" style={{ backgroundColor: `${colors.primary}44` }} />
              {showTitle ? (
                <Text className="mt-2 text-center text-lg font-scdream-bold" style={{ color: colors.brown }}>
                  {payload.title}
                </Text>
              ) : null}
              {payload.message ? (
                <ScrollView
                  style={{ maxHeight: 200 }}
                  className={showTitle ? 'mt-2' : 'mt-1'}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <Text
                    className={`text-center font-scdream ${showTitle ? 'text-[15px] leading-[22px]' : 'text-[16px] leading-[24px]'}`}
                    style={{ color: showTitle ? colors.textMuted : colors.text }}
                  >
                    {payload.message}
                  </Text>
                </ScrollView>
              ) : null}

              {buttons.length > 0 ? (
                <View className={`mt-4 ${isSingle ? '' : 'flex-row flex-wrap justify-center gap-2'}`}>
                  {isSingle ? renderButton(buttons[0]!, 0) : buttons.map((b, i) => renderButton(b, i))}
                </View>
              ) : (
                <View className="mt-1 h-1" />
              )}
            </View>
          ) : null}
        </View>
      </Modal>
    </>
  );
}
