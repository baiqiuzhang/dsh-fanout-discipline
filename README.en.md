# dsh-fanout-discipline

**[中文](README.md) | English**

DSH has no "auto-spawn subagents" switch — whether to fan out depends on the model's judgement. This plugin makes the five hardest rules **resident** in every session's system prompt.

It registers a `systemPrompt.section` (`order: 191`):

1. Before starting, check whether this turn has ≥2 independent sub-lines; if so, split mutually exclusive scopes and spawn 2–4 subagents at once.
2. For ≥5 homogeneous items (batch files, papers, translations, reviews) use `workflow` / batched fan-out instead of spawning one by one.
3. Subagent prompts must be self-contained, own a unique output path, and return only counts / paths / exceptions.
4. Do not parallelize: write dependencies, shared output files, GPU exclusivity, later steps depending on earlier results, edit-test-edit loops.
5. Judging "parallelizable" and then not spawning hands the serial cost to the user.

## Install

```
dsh plugin --profile desktop add https://github.com/baiqiuzhang/dsh-fanout-discipline/releases/download/v0.1.0/dsh-fanout-discipline-0.1.0.tgz
```

## Config

```yaml
config:
  enabled: false   # turn the section off
```

## Cost

About 300 characters (~200 tokens) per session, in the fixed prefix.

## License

MIT
