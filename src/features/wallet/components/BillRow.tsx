import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { SwipeableRow } from '@/components/ui/SwipeableRow';
import { Bill, Category } from '@/features/wallet/types';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { formatBillTime } from '@/lib/date';
import { useHaptic } from '@/lib/haptics';
import { formatBillAmount } from '@/lib/money';
import { getCardSurfaceStyle, tabularNumsStyle } from '@/theme/tokens';

export type BillRowProps = {
  bill: Bill;
  category?: Category;
  onPress: (bill: Bill) => void;
  onDelete?: (bill: Bill) => void;
};

/**
 * Section 6.7: 账单行（BillRow）
 * - 支出金额前加 -，使用 ink；收入加 +，使用 success
 * - 分类图标放在 40×40 的 surface-muted 圆角方块中
 * - 点击进入编辑；左滑删除（带触觉反馈）
 */
export const BillRow = React.memo(function BillRow({
  bill,
  category,
  onPress,
  onDelete,
}: BillRowProps) {
  const { theme, palette } = useResolvedTheme();
  const { haptic } = useHaptic();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const categoryName = category?.name ?? '其他';
  const iconName = category?.icon ?? 'ellipsis-horizontal-circle-outline';
  const displayTitle = bill.note.trim() || categoryName;
  const timeText = formatBillTime(bill.occurredAt);
  const amountText = formatBillAmount(bill.amountCents, bill.type);

  const handlePressIn = () => {
    scale.value = withTiming(0.985, {
      duration: 100,
      easing: Easing.out(Easing.quad),
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 120,
      easing: Easing.out(Easing.quad),
    });
  };

  const rowContent = (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={() => {
          haptic('selection');
          onPress(bill);
        }}
        onLongPress={() => {
          haptic('longPress');
          onPress(bill);
        }}
        delayLongPress={320}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`${displayTitle}，${categoryName}，${amountText}（点击编辑，左滑删除）`}
        style={getCardSurfaceStyle(theme, palette)}
        className="min-h-[64px] rounded-lg px-4 py-3 flex-row items-center justify-between">
        {/* 左侧 40×40 分类图标方块 + 标题与副标题 */}
        <View className="flex-row items-center flex-1 mr-3">
          <View
            accessible={false}
            className="w-[40px] h-[40px] rounded-md bg-surface-muted dark:bg-surface-muted-dark items-center justify-center mr-3">
            <Ionicons name={iconName} size={20} color={palette.ink} />
          </View>

          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="text-body-strong text-ink dark:text-ink-dark">
              {displayTitle}
            </Text>
            <Text className="text-caption text-ink-muted dark:text-ink-muted-dark mt-0.5">
              {categoryName} · {timeText}
            </Text>
          </View>
        </View>

        {/* 右侧金额 */}
        <Text
          style={tabularNumsStyle}
          className={`text-body-strong ${
            bill.type === 'income'
              ? 'text-success dark:text-success-dark'
              : 'text-ink dark:text-ink-dark'
          }`}>
          {amountText}
        </Text>
      </Pressable>
    </Animated.View>
  );

  if (!onDelete) {
    return rowContent;
  }

  return (
    <SwipeableRow onDelete={() => onDelete(bill)}>
      {rowContent}
    </SwipeableRow>
  );
});
