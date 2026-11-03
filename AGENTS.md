# AGENTS.md

## 完成标准（Definition of Done）

任何改动只有在下列检查全部通过后，才视为问题已解决；任一失败都算未完成，需继续修复。

```bash
pnpm lint                            # 0 error（warning 允许）
npx expo export --platform android   # Metro 打包成功
```

- 必须实际执行命令并以退出码为准，不能以“代码看起来没问题”代替验证。
- 打包失败时按 Metro 的 `Unable to resolve` 调用栈定位到具体包，不要靠猜测改配置。
- 修改 `metro.config.js` 后需同时验证 android 与 web 两条打包链路。
