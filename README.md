# dsh-fanout-discipline

**[English](README.en.md) | 中文**

DSH 没有「自动开子代理」的开关——是否 fan-out 完全取决于模型对任务结构的判断。这个插件把最硬的 5 条判断做成**常驻 system prompt 段**，每个会话、每个 preset 都生效，不依赖模型记得读 `AGENTS.md`。

## 它做什么

注册一个 `systemPrompt.section`（`order: 191`），内容：

1. 每轮开工先判：是否有 ≥2 条互不依赖的子线？有就划分互斥范围、一次 spawn 2–4 个；
2. 同构条目 ≥5 个用 `workflow` / `batched-subagent-fanout`，不逐个 spawn；
3. 子代理任务自包含、唯一输出路径、只回计数/路径/异常；
4. 不该并行的情形（写依赖、共享输出、显存互斥、改-测-改循环）；
5. 判断为可并行却没 spawn = 把串行成本转嫁给用户。

## 成本

约 200 token / 会话，属于固定前缀；不改变已有缓存命中（前缀不变的部分仍命中）。

## 配置

```yaml
config:
  enabled: false   # 关闭注入
```

## 它不做什么

- 不改变 `maxDepth` / `maxActiveSubagents` / `maxParallelToolCalls`——那些是 DSH 的容量参数，见 README 的「相关参数」。
- 不强制 spawn（没有 deny）：硬拦会把「本来就该串行」的场景也打断。

## 相关参数

| 参数 | 默认 | 位置 | 作用 |
|---|---|---|---|
| `subagent.maxDepth` | 1（本机 2） | profile `- id: subagent` | 允许的委派深度 |
| `maxActiveSubagents` | 8 | 插件 → 子智能体 → 限制 | 每棵树在线子代理上限 |
| `agent-loop.maxParallelToolCalls` | 20（本机） | profile `- id: agent-loop` | 同一步内工具并发上限 |
| `tool-todo.allowParallelInProgress` | true | preset 内的 tool-todo | todo 允许多个并行项 |
