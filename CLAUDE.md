# CLAUDE.md：claude-code-autoscroll-toggle 项目约定

一个 Claude Code 插件（mod），加一个 `/autoscroll [on|off]` 命令，切换 fullscreen 下的 Auto-scroll。以 marketplace 形式发布在 GitHub（`neoskyz/claude-code-autoscroll-toggle`），别人用 `/plugin marketplace add` + `/plugin install autoscroll-toggle@neoskyz` 安装。阶段：v0.1.0，可用。

## 目录地图

- `.claude-plugin/marketplace.json`：marketplace 清单，名字 `neoskyz`，列出 `plugins/` 下的插件。
- `plugins/autoscroll-toggle/`：插件本体（这个目录才会被装到用户机器上）。
  - `.claude-plugin/plugin.json`：插件 manifest，`name` 必须和 marketplace 条目一致。
  - `hooks/hooks.json` → `hooks/register.tsx`：hooks module（入口）。
  - `scripts/toggle-autoscroll.py`：fallback 脚本，通过 `$.plugin.root` 引用，stdlib only。
  - `tests/*.test.ts`：`claude plugin test` 跑的测试。
- `README.md`：给用户看的说明（英文）。
- `docs/`：`findings.md`（结论登记）、`decisions.md`（决策登记）、`todo.md`（唯一的待办清单）。

## 开工前先读

- `docs/todo.md`：现在在做什么、有什么等用户决定。
- `docs/findings.md`：哪些结论当前成立。
- `docs/decisions.md`：现行规则和"何时重新考虑"。

## 必须随时保持更新的东西（核心）

| 什么时候 | 更新什么 |
|---|---|
| 得出（或推翻）一个结论 | `docs/findings.md` |
| 做了一个决定（含"不做"） | `docs/decisions.md` |
| 任务被提出 / 批准 / 开工 / 做完 | `docs/todo.md` |
| 需要用户拍板 | `docs/todo.md` 的"待你决定" |
| 改 `plugins/autoscroll-toggle/hooks/` | `tests/` 加测试；`claude plugin validate` + `claude plugin test` 必须通过 |
| 发布新版本 | 改 `plugin.json` 的 `version`（用户按 version 缓存，不改版本号就收不到更新），README 的 "Tested with" 版本 |

### findings / decisions / todo

- `docs/findings.md`：编号 F-xxx，状态 `成立` / `已推翻` / `待验证`。被推翻的不删，标 `已推翻` 并链接新条目。
- `docs/decisions.md`：编号 D-xxx，写清做了什么、为什么、备选、何时重新考虑。状态 `生效` / `待定` / `已废止`。
- `docs/todo.md`：唯一的待办清单（不用 GitHub Issues）。编号 T-xxx。
- 编号只增不改。

## 安全硬规则（绝不能违反）

- 仓库里不能出现本机绝对路径（`/Users/...`）、邮箱、token。插件内部路径一律用 `$.plugin.root` 或 `${CLAUDE_PLUGIN_ROOT}`。
- fallback 脚本只改 `autoScrollEnabled` 这一个 key，原子写入，保留其他 key 和文件权限。
- 这是个人账号仓库（`neoskyz`），remote 必须是 SSH：`git@github.com:neoskyz/claude-code-autoscroll-toggle.git`。

## 工作约定

- Hooks module 用 TypeScript，Claude Code 直接加载，无构建步骤。遵守 static analysis 规则：`$.ns.method` 写全，不解构 `$`，`on()` 的事件名用字符串字面量。
- 脚本：`#!/usr/bin/env python3`，只用标准库。
- 本地调试：`claude --plugin-dir ./plugins/autoscroll-toggle`。注意本机 `~/.claude/skills/autoscroll-toggle/` 还有一份在用的副本，两份同时加载会重复注册 `/autoscroll`。
- 如果 shell 里的 `claude` 是带参数的 alias，`claude plugin test` 会拒绝运行，改用 `command claude plugin test ...`。
- 测试命令绝不接 `| tail` / `| head`。
- commit message 结尾的署名由 harness 提供，不要在这里写死模型名。

## 踩坑速查

- `claude plugin validate` 在插件目录下没有 README 时会报 README_MISSING（directory profile）；仓库根目录的 README 也算。
- marketplace 名不能用保留名（`claude-plugins-official` 等），也不能长得像官方名；插件名不能以 `claude-` 开头。
- `/config` 里 Auto-scroll 行的 key 是 `autoScroll`，对应 settings.json 里的 `autoScrollEnabled`。
