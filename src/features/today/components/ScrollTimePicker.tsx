import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { useHaptic } from '@/lib/haptics';
import { RadiusTokens, tabularNumsStyle } from '@/theme/tokens';

const ITEM_HEIGHT = 40;
const VISIBLE_COUNT = 3;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT; // 120px

export const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
export const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const QUICK_TIME_PRESETS = [
  { label: '上午 09:00', hour: '09', minute: '00' },
  { label: '下午 14:00', hour: '14', minute: '00' },
  { label: '傍晚 18:00', hour: '18', minute: '00' },
  { label: '晚上 20:00', hour: '20', minute: '00' },
];

type WheelColumnProps = {
  items: string[];
  selectedValue: string;
  onSelect: (val: string) => void;
  unitLabel: string;
};

function WheelColumn({ items, selectedValue, onSelect, unitLabel }: WheelColumnProps) {
  const { palette } = useResolvedTheme();
  const { haptic } = useHaptic();
  const scrollRef = useRef<ScrollView>(null);
  const isUserScrollingRef = useRef(false);
  const lastReportedValueRef = useRef(selectedValue);
  const lastHapticIndexRef = useRef<number>(-1);

  const selectedIndex = Math.max(0, items.indexOf(selectedValue));

  // 当外部改变选中值（如点击快捷预设）且非用户手动滚动中时，平滑滚动定位到该项
  useEffect(() => {
    if (!isUserScrollingRef.current && selectedValue !== lastReportedValueRef.current) {
      lastReportedValueRef.current = selectedValue;
      const idx = Math.max(0, items.indexOf(selectedValue));
      lastHapticIndexRef.current = idx;
      scrollRef.current?.scrollTo({
        y: idx * ITEM_HEIGHT,
        animated: true,
      });
    }
  }, [selectedValue, items]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index));

    // 用户滚动过程中仅触发触觉反馈，不频繁回写父组件状态避免双向反馈震荡（鬼畜）
    if (isUserScrollingRef.current && clampedIndex !== lastHapticIndexRef.current) {
      lastHapticIndexRef.current = clampedIndex;
      haptic('selection');
    }
  };

  const handleSettle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    isUserScrollingRef.current = false;
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
    const finalVal = items[clampedIndex];

    if (finalVal !== lastReportedValueRef.current) {
      lastReportedValueRef.current = finalVal;
      onSelect(finalVal);
    }

    // 确保滚轮精确吸附在刻度线上
    scrollRef.current?.scrollTo({
      y: clampedIndex * ITEM_HEIGHT,
      animated: true,
    });
  };

  return (
    <View style={styles.columnContainer}>
      <ScrollView
        ref={scrollRef}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentOffset={{ x: 0, y: selectedIndex * ITEM_HEIGHT }}
        onScrollBeginDrag={() => {
          isUserScrollingRef.current = true;
        }}
        onScrollEndDrag={(e) => {
          // 若没有惯性滚动（轻微拖拽后松手），直接就地对齐并提交
          const velocityY = e.nativeEvent.velocity?.y ?? 0;
          if (Math.abs(velocityY) < 0.05) {
            handleSettle(e);
          }
        }}
        onMomentumScrollBegin={() => {
          isUserScrollingRef.current = true;
        }}
        onMomentumScrollEnd={(e) => {
          handleSettle(e);
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}>
        {items.map((item, idx) => {
          const isSelected = item === selectedValue;
          return (
            <Pressable
              key={item}
              onPress={() => {
                isUserScrollingRef.current = false;
                lastReportedValueRef.current = item;
                lastHapticIndexRef.current = idx;
                haptic('selection');
                onSelect(item);
                scrollRef.current?.scrollTo({
                  y: idx * ITEM_HEIGHT,
                  animated: true,
                });
              }}
              style={styles.itemRow}>
              <Text
                style={[
                  tabularNumsStyle,
                  styles.itemText,
                  {
                    color: isSelected ? palette.ink : palette.inkSubtle,
                    fontWeight: isSelected ? '700' : '400',
                    fontSize: isSelected ? 20 : 15,
                  },
                ]}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Text
        style={[
          styles.unitText,
          {
            color: palette.inkSubtle,
          },
        ]}>
        {unitLabel}
      </Text>
    </View>
  );
}

export type ScrollTimePickerProps = {
  selectedDate: '今天' | '明天';
  onChangeDate: (date: '今天' | '明天') => void;
  selectedHour: string;
  selectedMinute: string;
  onChangeTime: (hour: string, minute: string) => void;
  hasTime: boolean;
  onToggleHasTime: (hasTime: boolean) => void;
};

/**
 * 任务时间滚动选择器
 * - 日期快捷切换：今天 / 明天
 * - 双列独立阻尼滚轮（时 / 分）
 * - 每滚过一个刻度触发轻触觉反馈（haptics.selection）
 * - 支持快速时间段预设与全天（清除时间）切换
 */
export function ScrollTimePicker({
  selectedDate,
  onChangeDate,
  selectedHour,
  selectedMinute,
  onChangeTime,
  hasTime,
  onToggleHasTime,
}: ScrollTimePickerProps) {
  const { palette } = useResolvedTheme();
  const { haptic } = useHaptic();

  if (!hasTime) {
    return (
      <Pressable
        onPress={() => {
          haptic('selection');
          onToggleHasTime(true);
        }}
        accessibilityRole="button"
        accessibilityLabel="添加任务提醒时间"
        className="flex-row items-center justify-between p-3.5 rounded-md bg-surface-muted dark:bg-surface-muted-dark">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={18} color={palette.inkMuted} style={{ marginRight: 8 }} />
          <Text className="text-body text-ink-muted dark:text-ink-muted-dark">
            添加具体时间（全天任务可留空）
          </Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={16} color={palette.inkMuted} />
      </Pressable>
    );
  }

  return (
    <View className="rounded-lg p-3 bg-surface-muted dark:bg-surface-muted-dark gap-3">
      {/* 头部：已选时间预览 + 清除时间操作 */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="alarm-outline" size={16} color={palette.accent} />
          <Text className="text-caption font-semibold text-accent dark:text-accent-dark">
            {selectedDate} {selectedHour}:{selectedMinute}
          </Text>
        </View>

        <Pressable
          onPress={() => {
            haptic('selection');
            onToggleHasTime(false);
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="清除时间设为全天">
          <Text className="text-micro text-ink-muted dark:text-ink-muted-dark">
            清除时间
          </Text>
        </Pressable>
      </View>

      {/* 日期分段选择：今天 / 明天 */}
      <View className="flex-row gap-2">
        {(['今天', '明天'] as const).map((d) => {
          const isSelected = selectedDate === d;
          return (
            <Pressable
              key={d}
              onPress={() => {
                if (d !== selectedDate) {
                  haptic('selection');
                  onChangeDate(d);
                }
              }}
              className={`flex-1 py-1.5 rounded-sm items-center justify-center ${
                isSelected
                  ? 'bg-surface-selected dark:bg-surface-selected-dark'
                  : 'bg-surface dark:bg-surface-dark'
              }`}>
              <Text
                className={`text-caption ${
                  isSelected
                    ? 'font-semibold text-ink dark:text-ink-dark'
                    : 'text-ink-muted dark:text-ink-muted-dark'
                }`}>
                {d}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 滚动时间轮盘 */}
      <View
        style={[
          styles.wheelCard,
          {
            backgroundColor: palette.surface,
            borderColor: palette.line,
          },
        ]}>
        {/* 中间高亮选中槽 */}
        <View
          pointerEvents="none"
          style={[
            styles.selectionIndicator,
            {
              backgroundColor: palette.surfaceSelected,
            },
          ]}
        />

        <View style={styles.columnsRow}>
          {/* 小时列 */}
          <WheelColumn
            items={HOURS}
            selectedValue={selectedHour}
            onSelect={(h) => onChangeTime(h, selectedMinute)}
            unitLabel="时"
          />

          {/* 冒号分隔 */}
          <View style={styles.colonWrapper}>
            <Text
              style={[
                tabularNumsStyle,
                styles.colonText,
                { color: palette.ink },
              ]}>
              :
            </Text>
          </View>

          {/* 分钟列 */}
          <WheelColumn
            items={MINUTES}
            selectedValue={selectedMinute}
            onSelect={(m) => onChangeTime(selectedHour, m)}
            unitLabel="分"
          />
        </View>
      </View>

      {/* 快捷时间段预设 */}
      <View className="flex-row flex-wrap gap-2">
        {QUICK_TIME_PRESETS.map((preset) => {
          const isSelected =
            selectedHour === preset.hour && selectedMinute === preset.minute;
          return (
            <Pressable
              key={preset.label}
              onPress={() => {
                haptic('selection');
                onChangeTime(preset.hour, preset.minute);
              }}
              accessibilityRole="button"
              accessibilityLabel={`选择时间 ${preset.label}`}
              className={`px-2.5 py-1 rounded-sm border ${
                isSelected
                  ? 'bg-accent-soft dark:bg-accent-soft-dark border-accent dark:border-accent-dark'
                  : 'bg-surface dark:bg-surface-dark border-transparent'
              }`}>
              <Text
                className={`text-micro ${
                  isSelected
                    ? 'font-semibold text-accent dark:text-accent-dark'
                    : 'text-ink-muted dark:text-ink-muted-dark'
                }`}>
                {preset.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wheelCard: {
    height: WHEEL_HEIGHT,
    borderRadius: RadiusTokens.md,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 8,
    right: 8,
    height: ITEM_HEIGHT,
    borderRadius: RadiusTokens.sm,
  },
  columnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: WHEEL_HEIGHT,
  },
  columnContainer: {
    width: 84,
    height: WHEEL_HEIGHT,
    position: 'relative',
    alignItems: 'center',
  },
  scrollContent: {
    paddingVertical: ITEM_HEIGHT,
  },
  itemRow: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    width: 84,
  },
  itemText: {
    textAlign: 'center',
  },
  colonWrapper: {
    width: 20,
    height: WHEEL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  colonText: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: -2,
  },
  unitText: {
    position: 'absolute',
    right: 4,
    top: ITEM_HEIGHT + 10,
    fontSize: 11,
    zIndex: 2,
    pointerEvents: 'none',
  },
});
