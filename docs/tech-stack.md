# DAYFLOW 技术选型与架构设计

> 版本：V1.0
> 适用范围：DAYFLOW MVP（Android 优先，兼容 iOS / Web）
> 关联文档：[PRD.md](./PRD.md)、[ui-design.md](./ui-design.md)

> 本项目为 **Expo / React Native** 技术栈，Flutter 相关规范不适用。状态管理按 **Zustand** 执行，样式按 **NativeWind** 执行，其余统一遵循项目全局编码规范。

---

## 1. 技术选型总览

### 1.1 核心决策

| 领域       | 选型                                    | 版本基线 | 选择理由                                                     |
| ---------- | --------------------------------------- | -------- | ------------------------------------------------------------ |
| 应用框架   | Expo + React Native                     | SDK 58 / RN 0.88 | 跨平台、原生 Tab、OTA 能力完善，团队已有脚手架              |
| 语言       | TypeScript（`strict`）                  | 6.0      | 全量类型约束，禁用 `any`                                     |
| 路由       | expo-router（文件路由 + typedRoutes）   | 58.0     | 基于文件结构，深层链接天然支持                               |
| 导航 UI    | expo-router NativeTabs                  | 58.0     | Android 原生底部导航，符合「原生体验」目标                   |
| 状态管理   | Zustand                                 | 5.x      | 轻量、无 Provider 嵌套、可直接在 Store 中调用 Repository     |
| 样式       | NativeWind（Tailwind 语法）             | v4 系列  | 符合全局 React 规范；设计 Token 集中在 `tailwind.config.js`  |
| 本地存储   | expo-sqlite（SQLite）                   | 58.x     | Local First 核心诉求；事务、索引、聚合能力满足统计需求       |
| ORM        | 不使用                                  | —        | MVP 仅 7 张表，手写 SQL + 类型化 Mapper 更可控、包体更小      |
| 动画       | react-native-reanimated + worklets      | 4.x      | 已在脚手架中，支持原生线程动画                               |
| 手势       | react-native-gesture-handler            | 3.x      | 滑动删除、拖拽排序                                           |
| 触觉反馈   | expo-haptics                            | 58.x     | 系统级触觉 API，可分级控制                                   |
| 本地通知   | expo-notifications                      | 58.x     | 支持定时通知，应用被杀后仍可触发                             |
| 文件与分享 | expo-file-system / expo-sharing / expo-document-picker | 58.x | 备份导出与导入的标准方案                           |
| ID 生成    | expo-crypto（`randomUUID`）             | 58.x     | 无需引入额外 uuid 库                                         |
| 日期处理   | dayjs（含 zh-cn locale）                | 1.x      | 轻量，自然月 / 自然日计算清晰                                |
| 包管理     | pnpm                                    | —        | 全局规范                                                     |
| 测试       | jest-expo + @testing-library/react-native | —      | 覆盖纯逻辑与关键组件                                         |
| 构建发布   | GitHub Actions + Gradle（prebuild）     | —        | 免 EAS 账号，产物为可覆盖安装的签名 APK                      |

### 1.2 关键取舍

| 决策点            | 选择                | 放弃的方案            | 原因                                                         |
| ----------------- | ------------------- | --------------------- | ------------------------------------------------------------ |
| 运行时            | Expo 原生构建       | Expo Go 演示          | 通知、SQLite、自定义签名必须使用开发构建 / 正式构建          |
| 样式              | NativeWind          | 纯 StyleSheet         | 遵循全局规范；Token 可配置化；暗色模式用 `dark:` 表达更直观   |
| 存储              | SQLite              | AsyncStorage / MMKV   | 需要按日期、月份聚合与索引查询，KV 存储不适合统计             |
| 状态              | Zustand             | Redux / Jotai         | 业务状态按领域拆分，异步 Action 简单直接                     |
| 图表              | 原生 View 绘制      | 图表库（ECharts 等）  | MVP 只需占比条与列表，避免引入重型依赖；环图需求出现时再评估 `react-native-svg` |
| 列表              | FlatList            | FlashList             | MVP 数据量小；账单超过 1000 条后再评估 FlashList             |
| 云同步            | 无                  | Supabase / 自建服务   | Local First，MVP 不做账号体系                                |

> NativeWind 与 RN 0.88 / React 19 的兼容版本以官方兼容表为准。**接入后第一步必须是 Android 开发构建的真机冒烟测试**（3 个 Tab 往返、暗色切换、滚动），通过后再开展页面开发；若出现不可解决的兼容问题，回退到 StyleSheet + Token 方案，UI 设计文档中的数值 Token 不受影响。

---

## 2. 系统架构

### 2.1 分层与数据流

严格单向依赖，禁止越层调用：

```
UI（expo-router 页面 + feature 组件）
  │  ref / selector / 事件
  ▼
Store（Zustand，按领域拆分）
  │  调用数据契约
  ▼
Repository（纯 TS 类，SQL 组装、行映射、异常转换）
  │  SQL / 文件 / 通知 API
  ▼
Data Source（expo-sqlite 单例、FileSystem、Notifications）
```

职责边界：

- **UI**：只负责渲染与事件委托，不出现 SQL、文件、`Dio` 类网络代码。
- **Store**：维护视图状态与异步 Action，负责调用 Repository，不写 SQL。
- **Repository**：纯 TypeScript，不依赖 React；负责参数绑定、行 → 领域对象映射、异常归一化。
- **Data Source**：数据库连接、迁移、平台 API 封装。

### 2.2 目录结构（Colocation）

```
src/
├── app/                          # expo-router 路由（薄页面层）
│   ├── _layout.tsx               # 全局 Provider、主题、启动初始化
│   ├── (tabs)/
│   │   ├── _layout.tsx           # NativeTabs：Today / Focus / Wallet
│   │   ├── index.tsx             # Today
│   │   ├── focus.tsx             # Focus
│   │   └── wallet.tsx            # Wallet
│   └── settings/
│       ├── index.tsx
│       ├── appearance.tsx
│       └── data.tsx
├── features/
│   ├── today/
│   │   ├── components/           # TaskRow、TopThreeSection、ProgressCard
│   │   ├── store/today-store.ts
│   │   ├── repository/task-repository.ts
│   │   ├── utils/progress.ts
│   │   └── types.ts
│   ├── focus/
│   │   ├── components/           # TimerDisplay、ModeSwitch、TimerControls
│   │   ├── store/focus-store.ts
│   │   ├── repository/focus-repository.ts
│   │   ├── timer/timer-machine.ts     # 纯函数状态机（可单测）
│   │   └── types.ts
│   ├── wallet/
│   │   ├── components/           # BudgetCard、BillRow、CategoryPicker
│   │   ├── store/wallet-store.ts
│   │   ├── repository/{budget,bill,category}-repository.ts
│   │   ├── utils/{budget,bill-stats}.ts
│   │   └── types.ts
│   └── backup/
│       ├── components/
│       ├── backup-service.ts
│       └── schema.ts             # 备份文件结构与校验
├── db/
│   ├── client.ts                 # SQLite 单例、PRAGMA、迁移入口
│   ├── migrations.ts             # 版本化迁移列表
│   └── mappers.ts                # 行类型 → 领域对象
├── components/ui/                # 仅跨领域通用组件（Button、Sheet、EmptyState）
├── hooks/
├── lib/
│   ├── date.ts                   # 本地日期、自然月工具
│   ├── money.ts                  # 分 ↔ 展示金额
│   ├── id.ts                     # randomUUID 封装
│   ├── haptics.ts                # 触觉反馈服务（读取设置）
│   ├── notifications.ts          # 通知调度封装
│   └── errors.ts                 # AppError 统一异常
├── constants/
└── theme/                        # Token 的 TS 导出（供原生属性使用）
```

约束：

- feature 之间不直接互相引用；跨领域能力放到 `lib/` 或 `db/`。
- 通用 UI 组件只有出现第二个使用方后才下沉到 `components/ui/`。

### 2.3 依赖注入

使用轻量模块级单例 + Store 构造时注入，避免为 MVP 引入 IoC 容器：

```ts
// src/db/client.ts
let dbInstance: SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  try {
    const db = await SQLite.openDatabaseAsync('dayflow.db');
    await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    await runMigrations(db);
    dbInstance = db;
    return db;
  } catch (error) {
    throw AppError.storage('openDatabase', error);
  }
}
```

```ts
// src/features/today/store/today-store.ts
export const useTodayStore = create<TodayState>((set, get) => ({
  tasks: [],
  status: 'idle',
  error: null,

  load: async (date: LocalDate) => {
    set({ status: 'loading', error: null });
    try {
      const repo = new TaskRepository(await getDatabase());
      set({ tasks: await repo.listByDate(date), status: 'ready' });
    } catch (error) {
      set({ status: 'error', error: toUserMessage(error) });
    }
  },
}));
```

### 2.4 错误处理

统一异常类型，避免把底层错误直接抛给 UI：

```ts
export type AppErrorCode = 'storage' | 'validation' | 'not_found' | 'backup' | 'unknown';

export class AppError extends Error {
  constructor(
    readonly code: AppErrorCode,
    readonly operation: string,
    readonly cause?: unknown,
    message?: string,
  ) {
    super(message ?? `[${code}] ${operation}`, { cause });
    this.name = 'AppError';
  }

  static storage(operation: string, cause: unknown): AppError {
    return new AppError('storage', operation, cause);
  }
}
```

- 所有 Repository 方法必须 `try / catch` 并转换为 `AppError`。
- Store 的异步 Action 必须捕获异常并写入 `error` 状态。
- UI 通过统一 Toast / 页面内提示展示 `toUserMessage(error)`，不展示原始堆栈。

---

## 3. 状态管理规范

- 每个领域一个 Store：`today-store`、`focus-store`、`wallet-store`、`settings-store`、`backup-store`。
- Store 只保存**视图状态 + 已加载数据**，不保存数据库连接、Repository 实例。
- 派生数据（完成率、预算使用率、每日可用金额）放在 `utils/` 纯函数中，组件内计算，不写回 Store。
- 禁止在组件间通过 props 传递复杂业务状态；跨页面共享状态走 Store。
- 设置项（主题、触觉、通知、时长、预算阈值）由 `settings-store` 单一持有，启动时从 `settings` 表加载一次。

---

## 4. 数据模型

### 4.1 通用约定

| 约定         | 规则                                                              |
| ------------ | ----------------------------------------------------------------- |
| 主键         | `TEXT` + UUID（`expo-crypto` 生成）                               |
| 时间戳       | `INTEGER`，UTC 毫秒时间戳                                         |
| 业务日期     | `TEXT`，用户本地时区的 `YYYY-MM-DD`（避免时区漂移）              |
| 月份键       | `TEXT`，`YYYY-MM`                                                 |
| 金额         | `INTEGER`，单位「分」，禁止浮点                                    |
| 布尔         | `INTEGER` 0 / 1                                                    |
| 软删除       | MVP 仅分类使用 `is_archived`，其余采用物理删除或保留历史           |
| 表名 / 列名  | 复数 snake_case，外键 `xxx_id`                                     |

### 4.2 表结构

```sql
-- 任务
CREATE TABLE IF NOT EXISTS tasks (
  id            TEXT    PRIMARY KEY,
  title         TEXT    NOT NULL,
  description   TEXT,
  date          TEXT    NOT NULL,
  priority      INTEGER NOT NULL DEFAULT 0,
  is_top3       INTEGER NOT NULL DEFAULT 0 CHECK (is_top3 IN (0, 1)),
  sort_order    INTEGER NOT NULL DEFAULT 0,
  completed_at  INTEGER,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tasks_date_sort
  ON tasks (date, is_top3 DESC, sort_order ASC);

-- 专注历史（仅已完成 / 中断的专注模式记录）
CREATE TABLE IF NOT EXISTS focus_sessions (
  id              TEXT    PRIMARY KEY,
  task_id         TEXT    REFERENCES tasks(id) ON DELETE SET NULL,
  mode            TEXT    NOT NULL CHECK (mode IN ('focus', 'short_break', 'long_break')),
  planned_seconds INTEGER NOT NULL,
  actual_seconds  INTEGER NOT NULL,
  started_at      INTEGER NOT NULL,
  ended_at        INTEGER,
  status          TEXT    NOT NULL CHECK (status IN ('completed', 'interrupted')),
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_started
  ON focus_sessions (started_at);

-- 进行中的计时（全局单行）
CREATE TABLE IF NOT EXISTS active_timer (
  id                  INTEGER PRIMARY KEY CHECK (id = 1),
  session_id          TEXT    NOT NULL,
  task_id             TEXT,
  mode                TEXT    NOT NULL CHECK (mode IN ('focus', 'short_break', 'long_break')),
  planned_seconds     INTEGER NOT NULL,
  phase               TEXT    NOT NULL CHECK (phase IN ('running', 'paused')),
  started_at          INTEGER NOT NULL,
  target_end_at       INTEGER NOT NULL,
  remaining_seconds   INTEGER NOT NULL,
  accumulated_seconds INTEGER NOT NULL DEFAULT 0,
  created_at          INTEGER NOT NULL
);

-- 月度预算
CREATE TABLE IF NOT EXISTS budgets (
  id         TEXT    PRIMARY KEY,
  month      TEXT    NOT NULL UNIQUE,
  amount     INTEGER NOT NULL CHECK (amount >= 0),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 分类
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT    PRIMARY KEY,
  name        TEXT    NOT NULL,
  type        TEXT    NOT NULL CHECK (type IN ('expense', 'income')),
  icon        TEXT    NOT NULL DEFAULT 'other',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_default  INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_type_name
  ON categories (type, name);

-- 账单
CREATE TABLE IF NOT EXISTS bills (
  id          TEXT    PRIMARY KEY,
  type        TEXT    NOT NULL CHECK (type IN ('expense', 'income')),
  amount      INTEGER NOT NULL CHECK (amount > 0),
  category_id TEXT    NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  note        TEXT,
  occurred_at INTEGER NOT NULL,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bills_occurred_at ON bills (occurred_at);
CREATE INDEX IF NOT EXISTS idx_bills_category ON bills (category_id);

-- 键值设置
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

### 4.3 业务约束的实现位置

- **Top 3 上限**：SQLite 无法用约束表达「按日聚合不超过 3 条」，在 `TaskRepository.setTop3()` 中使用事务：

```ts
await db.withTransactionAsync(async () => {
  const count = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) AS total FROM tasks WHERE date = ? AND is_top3 = 1 AND id <> ?',
    [date, taskId],
  );
  if ((count?.total ?? 0) >= 3) throw new AppError('validation', 'setTop3', null, '每日 Top 3 最多 3 条');
  await db.runAsync('UPDATE tasks SET is_top3 = 1, updated_at = ? WHERE id = ?', [Date.now(), taskId]);
});
```

- **分类引用保护**：外键 `ON DELETE RESTRICT` + 归档字段。
- **任务删除**：专注记录的 `task_id` 置空，历史保留。
- **金额**：`CHECK (amount > 0)`，类型由 `type` 字段表达正负。

### 4.4 迁移策略

- 使用 `PRAGMA user_version` 作为迁移版本号，启动时顺序执行。
- 每个迁移单独事务，失败即回滚并保留旧版本号。
- 迁移只允许「新增表 / 新增列 / 建索引」，MVP 禁止删列与重命名。
- 迁移前自动复制一份数据库文件到应用私有目录作为安全副本，保留最近 1 份。
- 版本升级不得清空数据库。

```ts
type Migration = {
  version: number;
  up: (db: SQLiteDatabase) => Promise<void>;
};

export const migrations: Migration[] = [
  { version: 1, up: async (db) => { await db.execAsync(SCHEMA_V1); } },
  // 后续版本追加，不修改历史条目
];
```

### 4.5 默认分类种子数据

首次启动（`user_version` 从 0 到 1）写入默认分类：支出 8 类、收入 4 类，`is_default = 1`。分类名称全局唯一由 `(type, name)` 唯一索引保证。

---

## 5. 关键实现方案

### 5.1 计时引擎（Focus）

**原则：显示靠刷新，时间靠时间戳。**

状态机为纯函数，输入 `ActiveTimer` 与当前时间，输出新状态与副作用指令：

```ts
export type TimerPhase = 'running' | 'paused';

export type ActiveTimer = {
  session_id: string;
  task_id: string | null;
  mode: FocusMode;
  planned_seconds: number;
  phase: TimerPhase;
  started_at: number;
  target_end_at: number;
  remaining_seconds: number;
  accumulated_seconds: number;
  created_at: number;
};

export type TimerAction =
  | { type: 'start'; timer: ActiveTimer }
  | { type: 'pause'; now: number }
  | { type: 'resume'; now: number }
  | { type: 'tick'; now: number }
  | { type: 'finish'; now: number; completed: boolean };
```

计算规则：

| 操作   | 计算                                                                 |
| ------ | -------------------------------------------------------------------- |
| 开始   | `target_end_at = now + planned_seconds * 1000`，`accumulated = 0`     |
| 刷新   | `remainingMs = max(0, target_end_at - now)`，仅用于渲染              |
| 暂停   | `remaining_seconds = ceil((target_end_at - now) / 1000)`；`accumulated += (now - started_at) / 1000` |
| 恢复   | `target_end_at = now + remaining_seconds * 1000`，`started_at = now`  |
| 完成   | `actual_seconds = planned_seconds`，`ended_at = target_end_at`        |
| 提前结束 | `actual_seconds = accumulated + (now - started_at) / 1000`，向下取整，`status = interrupted` |

持久化时机：

1. 开始 / 暂停 / 恢复 / 结束时写入 `active_timer`（或转为 `focus_sessions`）。
2. 每次写入必须 `await` 完成后再更新 UI 状态。
3. 完成后删除 `active_timer`，插入 `focus_sessions`，两步在同一事务内。

恢复逻辑：

- `_layout.tsx` 启动时读取 `active_timer`。
- 若 `phase = running` 且 `now >= target_end_at`：判定为已到点完成，写入历史记录（`actual = planned`，`ended_at = target_end_at`），清理 `active_timer`。
- 若 `phase = running` 且未到点：继续倒计时，剩余时间按时间戳重算。
- 若 `phase = paused`：展示暂停态与 `remaining_seconds`。
- 应用从后台回到前台时（`AppState` 变为 `active`）重复上述判定。

UI 刷新：

- 前台运行期间使用 `setInterval(250ms)` 触发显示刷新；该定时器只读时间戳，不累加时间。
- 页面不可见时暂停刷新。

### 5.2 本地通知

- 使用 `expo-notifications` 的本地定时通知。
- 开始 / 恢复计时时调度一条通知：`seconds = remaining_seconds`；暂停 / 结束 / 跳过时取消。
- 通知在应用被系统回收后仍由系统投递，是「后台提醒」的主要手段。
- Android 13+ 需申请 `POST_NOTIFICATIONS` 运行时权限；拒绝时仅影响提醒，不影响计时。
- 首次进入 Focus 页时再申请权限，不在启动时打扰。
- 通知渠道（Android）：`focus`（专注结束，默认重要性）、`break`（休息结束）。
- 不申请精确闹钟权限；允许系统对通知有数秒级延迟，计时结果不受影响。

### 5.3 触觉反馈

```ts
export type HapticKind = 'start' | 'pause' | 'complete' | 'taskDone' | 'warning';

export async function triggerHaptic(kind: HapticKind, enabled: boolean): Promise<void> {
  if (!enabled) return;
  try {
    if (kind === 'complete') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }
    if (kind === 'warning') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // 触觉反馈失败不影响业务，不向上抛出
  }
}
```

- 统一从 `settings.hapticEnabled` 读取开关，组件不直接调用 `expo-haptics`。

### 5.4 金额与日期

**金额**

- 存储与计算全部使用整数分。
- 输入解析：`parseAmountToCents('12.34') → 1234`，拒绝多于两位小数、负数、非数字。
- 展示：`formatCents(1234) → '12.34'`，千分位仅在超过 5 位数时启用。
- 汇总只使用 SQL `SUM` 或整数加法，禁止 `parseFloat` 参与计算。

**日期**

- `LocalDate` 为 `YYYY-MM-DD` 字符串，使用 dayjs 按本地时区生成。
- 今日统计范围：`[dayjs().startOf('day').valueOf(), dayjs().endOf('day').valueOf())`。
- 自然月：`startOf('month')` ~ `endOf('month')`；月份键 `format('YYYY-MM')`。
- 剩余自然日数（含当天）：`daysInMonth - date + 1`。

### 5.5 预算与统计

纯函数集中在 `features/wallet/utils/`：

```ts
export type BudgetSummary = {
  budgetCents: number;
  spentCents: number;
  remainingCents: number;
  usageRatio: number;      // 0 ~ 1+，预算为 0 时为 0
  dailyAllowanceCents: number;
};

export function summarizeBudget(
  budgetCents: number,
  spentCents: number,
  today: Dayjs,
): BudgetSummary {
  const remainingCents = budgetCents - spentCents;
  const usageRatio = budgetCents > 0 ? spentCents / budgetCents : 0;
  const remainingDays = today.daysInMonth() - today.date() + 1;
  const dailyAllowanceCents =
    budgetCents > 0 && remainingDays > 0
      ? Math.floor(Math.max(remainingCents, 0) / remainingDays)
      : 0;
  return { budgetCents, spentCents, remainingCents, usageRatio, dailyAllowanceCents };
}
```

统计查询在 SQL 中完成：

```sql
-- 本月收支汇总
SELECT
  COALESCE(SUM(CASE WHEN type = 'income'  THEN amount END), 0) AS income,
  COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS expense
FROM bills
WHERE occurred_at >= ? AND occurred_at < ?;

-- 分类支出占比
SELECT c.id, c.name, SUM(b.amount) AS total
FROM bills b
JOIN categories c ON c.id = b.category_id
WHERE b.type = 'expense' AND b.occurred_at >= ? AND b.occurred_at < ?
GROUP BY c.id
ORDER BY total DESC;

-- 今日专注
SELECT COUNT(*) AS sessions, COALESCE(SUM(actual_seconds), 0) AS seconds
FROM focus_sessions
WHERE mode = 'focus' AND status = 'completed' AND ended_at >= ? AND ended_at < ?;
```

### 5.6 备份与恢复

备份文件结构（`schemaVersion = 1`）：

```json
{
  "app": "dayflow",
  "schemaVersion": 1,
  "appVersion": "1.0.0",
  "exportedAt": 1760000000000,
  "data": {
    "tasks": [],
    "focusSessions": [],
    "budgets": [],
    "categories": [],
    "bills": [],
    "settings": {}
  }
}
```

导出流程：

1. 事务内读取全部表（保证快照一致）。
2. 序列化为 JSON，写入缓存目录 `dayflow-backup-YYYYMMDD-HHmm.json`。
3. 调用系统分享面板（`expo-sharing`）或保存到用户选择的目录。

导入流程：

1. `expo-document-picker` 选择文件，限制大小（建议 ≤ 10 MB）。
2. 逐字段校验：类型、必填项、外键存在性、金额为正整数、枚举值合法。
3. 校验 `app === 'dayflow'` 且 `schemaVersion <= 当前版本`；高于当前版本直接拒绝，提示升级 App。
4. 弹窗说明「将完整替换当前数据，且不可恢复」，用户确认后执行。
5. 单个事务内：删除全部业务表数据 → 按依赖顺序插入（categories → tasks → focus_sessions → budgets → bills → settings）→ 提交。
6. 任一步失败：回滚，保留原有数据，提示具体失败原因。
7. 恢复成功后清空各 Store 并重新加载。

### 5.7 防止重复入账

- 新增 / 编辑账单的提交按钮在请求期间置为 disabled。
- Store Action 使用 `submitting` 标志，重复调用直接返回。
- 账单主键由客户端生成，重复插入同 ID 会触发主键冲突，作为最后一道防线。

---

## 6. NativeWind 与设计 Token

- `tailwind.config.js` 是颜色、字号、圆角、间距的**唯一来源**。
- `global.css` 只保留字体栈与 CSS 变量（Web 端）。
- 组件使用 `className`，不直接写十六进制颜色。
- 原生专属属性（如 `fontVariant: ['tabular-nums']`、阴影、Reanimated 颜色插值）通过 `theme/tokens.ts` 导出同一组数值，避免两套定义。
- 暗色模式使用 `dark:` 变体；主题切换由 `settings-store` 驱动（light / dark / system）。
- 现有脚手架的 `ThemedText` / `ThemedView` / `constants/theme.ts` 在迁移到 NativeWind 后删除，避免双轨制。

---

## 7. 性能与稳定性

### 7.1 性能

- 启动：先 `preventAutoHideAsync` 保持启动屏，数据库迁移与设置加载完成后再 `hideAsync`，避免白屏。
- 查询：所有按日期 / 月份 / 分类的过滤字段建立索引；统计在 SQL 聚合，不在 JS 中全量遍历。
- 列表：`FlatList` + 稳定 `keyExtractor` + `React.memo` 行组件；避免在 `renderItem` 内创建新函数对象。
- 动画：使用 Reanimated worklet，避免在 JS 线程驱动高频动画。
- 计时 UI：250ms 刷新仅更新文本，不触发整页重渲染（使用局部 state 或 Reanimated shared value）。
- 已开启 `reactCompiler` 实验特性；新增组件保持纯函数与不可变更新。

### 7.2 稳定性

- 数据库写入统一 `withTransactionAsync`，尤其是「完成任务 + 更新进度」这类多表操作。
- 应用升级不清库；迁移失败保留原库并提示用户导出备份。
- 计时状态持久化在 `active_timer`，与显示状态解耦。
- 金额全程整数运算。
- 全局错误边界捕获渲染异常，展示可恢复页面而非白屏。

### 7.3 隐私

- 不接入任何第三方统计 / 崩溃上报 SDK。
- 不声明网络权限用于数据上传；导出文件由用户主动分享。
- 通知权限延迟到首次使用 Focus 时申请。

---

## 8. 测试策略

| 层级     | 范围                                                       | 工具                          |
| -------- | ---------------------------------------------------------- | ----------------------------- |
| 单元测试 | 金额解析与格式化、日期区间、预算汇总、计时状态机、备份校验 | Jest                          |
| 组件测试 | TaskRow 完成切换、BillForm 金额输入与校验、空状态           | @testing-library/react-native |
| 集成测试 | 真机 / 模拟器验证数据库迁移、备份导入导出、进程回收恢复     | 手动 + 开发构建               |
| 静态检查 | TypeScript 严格模式、ESLint                                | `tsc --noEmit`、`expo lint`   |

必测边界：

- 预算为 0、支出超过预算、跨月、月末最后一天。
- 计时：暂停跨应用重启、暂停后恢复、应用被杀后到点、提前结束。
- 金额：`0.01` 连续累加 100 次、输入 `1.005`、空输入、超大值。
- 备份：字段缺失、版本过高、外键悬空、恢复中途失败回滚。

提交前必须通过：

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
```

---

## 9. 构建与发布

### 9.1 应用标识

- `applicationId`：`com.alkaidstart.dayflow`（一旦发布不可更改，否则会被视为新应用，用户数据无法覆盖保留）。
- `version`：语义化版本，随功能发布递增。
- `android.versionCode`：每次发布 +1，由发布脚本或 CI 检查与递增。
- 签名密钥：生成后离线备份，**丢失将导致无法覆盖安装**。

### 9.2 CI 流程（GitHub Actions）

触发条件：推送 `v*` 标签或手动 `workflow_dispatch`。

步骤：

1. 检出代码，安装 pnpm、Node LTS、Java 17。
2. `pnpm install --frozen-lockfile`。
3. `pnpm lint` + `pnpm exec tsc --noEmit` + `pnpm test`。
4. 从 Secrets 还原 keystore 到 `android/app/dayflow.keystore`。
5. `npx expo prebuild --platform android --clean`。
6. `cd android && ./gradlew assembleRelease`。
7. 校验 APK 签名与 `applicationId`。
8. 上传 APK 为构建产物（Artifact）并附加到 Release。

所需 Secrets：

| Secret                        | 用途                     |
| ----------------------------- | ------------------------ |
| `ANDROID_KEYSTORE_BASE64`     | keystore 文件的 Base64   |
| `ANDROID_KEYSTORE_PASSWORD`   | keystore 密码            |
| `ANDROID_KEY_ALIAS`           | 密钥别名                 |
| `ANDROID_KEY_PASSWORD`        | 密钥密码                 |

注意：

- `android/` 目录不提交仓库，由 `expo prebuild` 在 CI 生成，`app.json` 为原生配置唯一来源。
- 签名配置通过 CI 写入 `android/gradle.properties` 或 `signingConfigs`，不得提交明文密码。
- 版本号发布前检查：`versionCode` 必须大于上一版，否则覆盖安装失败。

### 9.3 本地开发

```bash
pnpm install
pnpm android      # 开发构建，通知 / SQLite 必须使用此方式
```

Expo Go 不适用于本项目（通知与原生模块限制），团队统一使用开发构建。

---

## 10. 风险与应对

| 风险                                   | 影响                       | 应对                                                         |
| -------------------------------------- | -------------------------- | ------------------------------------------------------------ |
| NativeWind 与 RN 0.88 兼容问题         | 样式方案受阻               | 接入首日验证；失败则回退 StyleSheet + 同一套 Token           |
| 国产 ROM 后台杀进程                    | 通知不达、计时中断         | 计时以时间戳为准；通知由系统投递；设置页给出后台运行指引     |
| Android 13 通知权限被拒                | 无提醒                     | 不影响计时；页面内提供重新授权入口                           |
| 迁移失败导致数据损坏                   | 用户数据丢失               | 迁移前备份数据库文件、单事务迁移、失败回滚                   |
| keystore 丢失                          | 无法覆盖安装               | 离线多处备份；CI Secret 与本地各存一份                       |
| 修改 `applicationId`                   | 用户数据无法继承           | 首发前确定并冻结                                             |
| 备份文件过大                           | 导入卡顿                   | 限制 10 MB、导入前提示、事务导入                             |
| SQLite 并发写                          | 数据锁定                   | 单连接、WAL 模式、写操作串行化                               |
