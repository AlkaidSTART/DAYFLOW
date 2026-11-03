import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sheet } from '@/components/ui/Sheet';
import { formatCentsNumber, parseAmountToCents } from '@/lib/money';
import { tabularNumsStyle } from '@/theme/tokens';

export type BudgetFormSheetProps = {
  visible: boolean;
  currentBudgetCents: number;
  onClose: () => void;
  onSaveBudget: (amountCents: number) => void;
};

const BUDGET_PRESETS_YUAN = [1000, 1280, 1500, 2000];

function BudgetFormSheetContent({
  visible,
  currentBudgetCents,
  onClose,
  onSaveBudget,
}: BudgetFormSheetProps) {
  const [input, setInput] = useState(
    currentBudgetCents > 0
      ? formatCentsNumber(currentBudgetCents).replace(/,/g, '')
      : '',
  );
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const cents = parseAmountToCents(input);
    if (cents === null) {
      setError('请输入大于 0 的月度预算金额');
      return;
    }
    onSaveBudget(cents);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="设置本月预算">
      <View className="gap-4">
        <Input
          label="月度预算金额"
          placeholder="1280.00"
          value={input}
          onChangeText={(v) => {
            setInput(v);
            if (error) setError(null);
          }}
          isAmount
          error={error}
        />

        <View>
          <Text className="text-caption text-ink-muted dark:text-ink-muted-dark mb-2">
            常用生活费档位
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {BUDGET_PRESETS_YUAN.map((yuan) => (
              <Pressable
                key={yuan}
                onPress={() => {
                  setInput(`${yuan}.00`);
                  setError(null);
                }}
                accessibilityRole="button"
                accessibilityLabel={`设置预算 ${yuan} 元`}
                className="px-3.5 py-2 rounded-md bg-surface-muted dark:bg-surface-muted-dark">
                <Text
                  style={tabularNumsStyle}
                  className="text-caption font-semibold text-ink dark:text-ink-dark">
                  ¥ {yuan}.00
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="flex-row gap-3 mt-2">
          {currentBudgetCents > 0 ? (
            <Button
              label="清除预算"
              onPress={() => {
                onSaveBudget(0);
                onClose();
              }}
              variant="secondary"
              size="md"
              className="flex-1"
            />
          ) : (
            <Button
              label="取消"
              onPress={onClose}
              variant="secondary"
              size="md"
              className="flex-1"
            />
          )}

          <Button
            label="保存预算"
            onPress={handleSave}
            variant="primary"
            size="md"
            className="flex-1"
          />
        </View>
      </View>
    </Sheet>
  );
}

export function BudgetFormSheet(props: BudgetFormSheetProps) {
  if (!props.visible) return null;
  return <BudgetFormSheetContent key={props.currentBudgetCents} {...props} />;
}
