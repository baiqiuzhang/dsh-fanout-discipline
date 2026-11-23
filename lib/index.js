// dsh-fanout-discipline — 常驻的「并行/委派」提示段。
//
// 为什么需要它：DSH 没有任何「自动 fan-out」参数；模型是否开子代理，取决于
// 它对任务结构的判断 + 工具描述。工具描述只说「能委派」，不说「什么时候该
// 委派」；AGENTS.md 的规则只在会话首次注入，长会话里会被稀释。这里把最硬的
// 5 条判断做成 systemPrompt.section，每个会话/每个 preset 都常驻。
//
// 代价：约 200 token / 会话（固定前缀，不破坏后续缓存命中）。关闭方式：
// cordis.patch.yml 里 config.enabled: false。

export const name = "dsh-fanout-discipline";
export const inject = ["systemPrompt"];

const SECTION_NAME = "fanout-discipline";
const SECTION_ORDER = 191; // todo-float-ball 的 190 之右，plan-policy(500) 之前

const TEXT = [
  "【并行与委派纪律 · 由 dsh-fanout-discipline 常驻注入】",
  "每轮开工先做一次 fan-out 判断（30 秒）：",
  "1. 本轮是否有 ≥2 条互不依赖的子线（不同模块/文件/目录/文档/实验分支/评审视角）？有就先划分互斥范围，一次性 spawn 2–4 个子代理并行推进；不要串行做完整条再做下一条。",
  "2. 同构条目 ≥5 个（批量文件、论文、翻译、审阅）用 workflow 或 batched-subagent-fanout 一次编排，不要逐个 spawn。",
  "3. 子代理任务必须自包含：完整上下文、唯一输出路径、只回计数/路径/异常；主代理只读汇总并抽样核对。",
  "4. 不该并行的情形：有写依赖、共享输出文件、显存互斥、后步依赖前步结果、改-测-改循环。",
  "5. 判断为「可并行」却没有 spawn，等于把串行成本转嫁给用户；只读调研宁可多开一个子代理。",
].join("\n");

export function apply(ctx, config) {
  if (config && config.enabled === false) {
    ctx.logger.info("dsh-fanout-discipline: disabled by config");
    return;
  }
  const dispose = ctx.systemPrompt.section({
    name: SECTION_NAME,
    order: SECTION_ORDER,
    text: TEXT,
  });
  ctx.effect(() => dispose, "dsh-fanout-discipline: prompt section");
  ctx.logger.info(`dsh-fanout-discipline: section registered (${TEXT.length} chars)`);
}
