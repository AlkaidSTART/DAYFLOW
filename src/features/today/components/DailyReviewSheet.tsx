import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sheet } from '@/components/ui/Sheet';
import { Task } from '@/features/today/types';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { tabularNumsStyle } from '@/theme/tokens';

export type DailyReviewSheetProps = {
  visible: boolean;
  tasks: Task[];
  focusSessionsCount: number;
  focusMinutesTotal: number;
  note: string;
  onSaveNote: (note: string) => void;
  onClose: () => void;
};

/**
 * PRD 4.1.4: 每日复盘
 * - 今日完成了什么
 * - 今日专注时长
 * - 今日待完成任务
 * - 可选文字备注
 */
export function DailyReviewSheet({
  visible,
  tasks,
  focusSessionsCount,
  focusMinutesTotal,
  note,
  onSaveNote,
  onClose,
}: DailyReviewSheetProps) {
  if (!visible) return null;
  return (
    <DailyReviewSheetContent
      key={note}
      visible={visible}
      tasks={tasks}
      focusSessionsCount={focusSessionsCount}
      focusMinutesTotal={focusMinutesTotal}
      note={note}
      onSaveNote={onSaveNote}
      onClose={onClose}
    />
  );
}

function DailyReviewSheetContent({
  visible,
  tasks,
  focusSessionsCount,
  focusMinutesTotal,
  note,
  onSaveNote,
  onClose,
}: DailyReviewSheetProps) {
  const { palette } = useResolvedTheme();
  const [draftNote, setDraftNote] = useState(note);

  const completedTasks = tasks.filter((t) => t.completedAt !== null);
  const pendingTasks = tasks.filter((t) => t.completedAt === null);

  return (
    <Sheet visible={visible} onClose={onClose} title="今日复盘">
      <View className="gap-5">
        {/* 概览卡片 */}
        <View className="flex-row gap-3">
          <View
            style={{ backgroundColor: palette.surfaceMuted }}
            className="flex-1 rounded-md p-3.5">
            <Text style={{ color: palette.inkMuted }} className="text-caption">
              已完成任务
            </Text>
            <Text
              style={[tabularNumsStyle, { color: palette.ink }]}
              className="text-h2 mt-1 font-semibold">
              {completedTasks.length} 项
            </Text>
          </View>

          <View
            style={{ backgroundColor: palette.surfaceMuted }}
            className="flex-1 rounded-md p-3.5">
            <Text style={{ color: palette.inkMuted }} className="text-caption">
              今日专注
            </Text>
            <Text
              style={[tabularNumsStyle, { color: palette.ink }]}
              className="text-h2 mt-1 font-semibold">
              {focusMinutesTotal} 分钟
            </Text>
            <Text
              style={[tabularNumsStyle, { color: palette.inkSubtle }]}
              className="text-micro mt-0.5">
              共 {focusSessionsCount} 次专注
            </Text>
          </View>
        </View>

        {/* 已完成清单 */}
        <View>
          <Text
            style={{ color: palette.inkMuted }}
            className="text-caption font-semibold mb-2">
            今日已完成
          </Text>
          {completedTasks.length === 0 ? (
            <Text style={{ color: palette.inkSubtle }} className="text-caption">
              还没有完成的任务
            </Text>
          ) : (
            <View className="gap-2">
              {completedTasks.map((t) => (
                <View key={t.id} className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={18} color={palette.success} />
                  <Text style={{ color: palette.ink }} className="text-body ml-2">
                    {t.title}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 待完成清单 */}
        {pendingTasks.length > 0 ? (
          <View>
            <Text
              style={{ color: palette.inkMuted }}
              className="text-caption font-semibold mb-2">
              待完成（{pendingTasks.length}）
            </Text>
            <View className="gap-2">
              {pendingTasks.map((t) => (
                <View key={t.id} className="flex-row items-center">
                  <Ionicons name="ellipse-outline" size={16} color={palette.inkSubtle} />
                  <Text
                    style={{ color: palette.inkMuted }}
                    className="text-body ml-2">
                    {t.title}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* 可选文字备注 */}
        <Input
          label="今日随记（可选）"
          placeholder="记录今天的一点想法或收获"
          value={draftNote}
          onChangeText={setDraftNote}
          multiline
        />

        <Button
          label="保存复盘"
          onPress={() => {
            onSaveNote(draftNote);
            onClose();
          }}
          variant="primary"
          size="md"
          fullWidth
        />
      </View>
    </Sheet>
  );
}
