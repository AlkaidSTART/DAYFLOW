import Ionicons from '@expo/vector-icons/Ionicons';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SegmentedControl, SegmentOption } from '@/components/ui/SegmentedControl';
import { Sheet } from '@/components/ui/Sheet';
import { CategoryPicker } from '@/features/wallet/components/CategoryPicker';
import { Bill, BillDraft, BillType, Category } from '@/features/wallet/types';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { formatCentsNumber, parseAmountToCents } from '@/lib/money';

const TYPE_OPTIONS: SegmentOption<BillType>[] = [
  { value: 'expense', label: '支出' },
  { value: 'income', label: '收入' },
];

type DatePreset = 'today' | 'yesterday' | 'twoDaysAgo';

export type BillFormSheetProps = {
  visible: boolean;
  editingBill: Bill | null;
  categories: Category[];
  onClose: () => void;
  onSave: (draft: BillDraft) => void;
  onDelete?: (bill: Bill) => void;
};

function parseBillInitialDatePreset(occurredAt?: number): DatePreset {
  if (!occurredAt) return 'today';
  const billDay = dayjs(occurredAt).startOf('day');
  const today = dayjs().startOf('day');
  if (billDay.isSame(today)) return 'today';
  if (billDay.isSame(today.subtract(1, 'day'))) return 'yesterday';
  return 'twoDaysAgo';
}

function BillFormSheetContent({
  visible,
  editingBill,
  categories,
  onClose,
  onSave,
  onDelete,
}: BillFormSheetProps) {
  const { palette } = useResolvedTheme();

  const [type, setType] = useState<BillType>(editingBill?.type ?? 'expense');
  const [amountInput, setAmountInput] = useState(
    editingBill ? formatCentsNumber(editingBill.amountCents).replace(/,/g, '') : '',
  );
  const [categoryId, setCategoryId] = useState(editingBill?.categoryId ?? 'cat_exp_food');
  const [note, setNote] = useState(editingBill?.note ?? '');
  const [datePreset, setDatePreset] = useState<DatePreset>(
    parseBillInitialDatePreset(editingBill?.occurredAt),
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleChangeType = (nextType: BillType) => {
    setType(nextType);
    const firstCat = categories.find((c) => c.type === nextType);
    if (firstCat) {
      setCategoryId(firstCat.id);
    }
  };

  const resolveTimestamp = (): number => {
    if (editingBill && datePreset === 'today' && dayjs(editingBill.occurredAt).isSame(dayjs(), 'day')) {
      return editingBill.occurredAt;
    }
    const now = dayjs();
    if (datePreset === 'yesterday') {
      return now.subtract(1, 'day').valueOf();
    }
    if (datePreset === 'twoDaysAgo') {
      return now.subtract(2, 'day').valueOf();
    }
    return now.valueOf();
  };

  const handleSubmit = () => {
    if (submitting) return;
    const cents = parseAmountToCents(amountInput);
    if (cents === null) {
      setError('请输入有效金额（大于 0，最多两位小数）');
      return;
    }

    setSubmitting(true);
    onSave({
      type,
      amountCents: cents,
      categoryId,
      note,
      occurredAt: resolveTimestamp(),
    });
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={editingBill ? '编辑账单' : '记一笔'}>
      <View className="gap-4">
        {/* 支出 / 收入切换在顶部 Segmented Control (Section 6.8) */}
        <SegmentedControl
          options={TYPE_OPTIONS}
          value={type}
          onChange={handleChangeType}
        />

        {/* 金额输入：数字键盘，右对齐，tabular-nums，前置 ¥ 固定 (Section 6.10) */}
        <Input
          label="金额"
          placeholder="0.00"
          value={amountInput}
          onChangeText={(v) => {
            setAmountInput(v);
            if (error) setError(null);
          }}
          isAmount
          error={error}
        />

        {/* 4 列分类网格选择器 (Section 6.8) */}
        <CategoryPicker
          categories={filteredCategories}
          selectedCategoryId={categoryId}
          onSelect={setCategoryId}
        />

        {/* 日期快捷选择 */}
        <View>
          <Text className="text-caption text-ink-muted dark:text-ink-muted-dark mb-2">
            日期
          </Text>
          <View className="flex-row gap-2">
            {(
              [
                { key: 'today', label: '今天' },
                { key: 'yesterday', label: '昨天' },
                { key: 'twoDaysAgo', label: '前天' },
              ] as const
            ).map((item) => {
              const active = datePreset === item.key;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setDatePreset(item.key)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  className={`flex-1 min-h-[40px] rounded-md items-center justify-center ${
                    active
                      ? 'bg-surface-selected dark:bg-surface-selected-dark'
                      : 'bg-surface-muted dark:bg-surface-muted-dark'
                  }`}>
                  <Text
                    className={`text-caption ${
                      active
                        ? 'text-ink dark:text-ink-dark font-semibold'
                        : 'text-ink-muted dark:text-ink-muted-dark'
                    }`}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 备注输入 */}
        <Input
          label="备注（可选）"
          placeholder="例如：食堂午饭、超市采购"
          value={note}
          onChangeText={setNote}
        />

        {/* 底部操作区 */}
        {confirmDelete && editingBill && onDelete ? (
          <View className="p-4 rounded-md bg-surface-muted dark:bg-surface-muted-dark gap-3 mt-1">
            <Text className="text-caption text-ink dark:text-ink-dark">
              将删除这条账单，且无法恢复
            </Text>
            <View className="flex-row gap-3">
              <Button
                label="取消"
                onPress={() => setConfirmDelete(false)}
                variant="secondary"
                size="md"
                className="flex-1"
              />
              <Button
                label="确认删除"
                onPress={() => {
                  onDelete(editingBill);
                  onClose();
                }}
                variant="danger"
                size="md"
                className="flex-1"
              />
            </View>
          </View>
        ) : (
          <View className="flex-row items-center gap-3 mt-2">
            {editingBill && onDelete ? (
              <Pressable
                onPress={() => setConfirmDelete(true)}
                accessibilityRole="button"
                accessibilityLabel="删除账单"
                className="h-[48px] px-4 rounded-md bg-surface-muted dark:bg-surface-muted-dark items-center justify-center">
                <Ionicons name="trash-outline" size={20} color={palette.danger} />
              </Pressable>
            ) : null}

            <Button
              label="取消"
              onPress={onClose}
              variant="secondary"
              size="md"
              className="flex-1"
            />
            <Button
              label="保存账单"
              onPress={handleSubmit}
              disabled={submitting}
              variant="primary"
              size="md"
              className="flex-1"
            />
          </View>
        )}
      </View>
    </Sheet>
  );
}

export function BillFormSheet(props: BillFormSheetProps) {
  if (!props.visible) return null;
  return <BillFormSheetContent key={props.editingBill?.id ?? 'create'} {...props} />;
}
