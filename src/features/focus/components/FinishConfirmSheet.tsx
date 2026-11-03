import React from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';

export type FinishConfirmSheetProps = {
  visible: boolean;
  onClose: () => void;
  onConfirmRecord: () => void;
  onConfirmDiscard: () => void;
};

/**
 * Section 6.5: 结束操作使用底部弹层二次确认：「结束本次专注并记录？」
 */
export function FinishConfirmSheet({
  visible,
  onClose,
  onConfirmRecord,
  onConfirmDiscard,
}: FinishConfirmSheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose} title="结束本次专注并记录？">
      <View className="gap-4">
        <Text className="text-body text-ink-muted dark:text-ink-muted-dark">
          你可以将已经进行的时长记录到今日专注统计中，或者直接放弃本次计时。
        </Text>

        <View className="gap-2.5 mt-2">
          <Button
            label="结束并记录时长"
            onPress={() => {
              onConfirmRecord();
              onClose();
            }}
            variant="primary"
            size="md"
            fullWidth
          />
          <Button
            label="放弃本次计时"
            onPress={() => {
              onConfirmDiscard();
              onClose();
            }}
            variant="secondary"
            size="md"
            fullWidth
          />
          <Button
            label="继续专注"
            onPress={onClose}
            variant="ghost"
            size="md"
            fullWidth
          />
        </View>
      </View>
    </Sheet>
  );
}
