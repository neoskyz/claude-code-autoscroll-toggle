# 决策登记（Decisions）

> 规则：编号只增不改。状态 `生效` / `待定` / `已废止`。改决定时不删旧条目：旧条目标 `已废止 → D-xxx`，新开一条。
> 每条写：做了什么、为什么、备选方案、何时重新考虑。结论见 [findings.md](findings.md)，待办见 [todo.md](todo.md)。

---

### D-001 仓库本身就是 marketplace，插件放在 `plugins/autoscroll-toggle/`

- **状态：** 生效（2026-11-04）
- **内容：** 根目录 `.claude-plugin/marketplace.json`（名字 `neoskyz`），条目 `source: "./plugins/autoscroll-toggle"`。安装 id 是 `autoscroll-toggle@neoskyz`。
- **为什么：** 用户只要一个 `owner/repo` 就能 add + install；插件放子目录，README / docs / CLAUDE.md 不会被装进用户的插件缓存；以后可以在同一 marketplace 加别的插件。
- **备选：** 插件放根目录（`source: "./"`），会把整个仓库装进去；单独的 marketplace 仓库（多维护一个仓库）。
- **何时重新考虑：** 提交到 Anthropic 官方目录时，按其要求调整。

### D-002 Fallback 脚本随插件分发，用 `python3` 显式调用

- **状态：** 生效（2026-11-04）
- **内容：** 脚本在 `scripts/toggle-autoscroll.py`，`register.ts` 用 `['python3', $.plugin.root + '/scripts/toggle-autoscroll.py', arg]` 调用。脚本支持 `CLAUDE_CONFIG_DIR`，settings.json 不存在时新建。
- **为什么：** 不依赖用户机器上的固定路径；显式 `python3` 不依赖可执行位（zip 分发时会丢）。
- **备选：** 用 `$.fs.read/write` 在 TS 里改 settings.json（`$.fs.write` 不是原子写，不选）。
- **何时重新考虑：** 如果 `$.config.set` 在所有支持的版本上都可用，可以删掉 fallback。

### D-003 不随插件分发快捷键

- **状态：** 生效（2026-11-04）
- **内容：** README 给出 `~/.claude/keybindings.json` 片段（`ctrl+x ctrl+f` → `command:autoscroll`），由用户自己加。
- **为什么：** 插件组件里没有 keybindings 这一类（见 F-001）。
- **何时重新考虑：** Claude Code 支持插件提供 keybindings 时。

### D-004 快捷键改为借用 `theme:editCustom`，由 PromptHint 里的隐藏 Button 响应

- **状态：** 生效（2026-11-05）
- **内容：** `ui.render` hook 挂在 `PromptHint`（prompt 下面那行提示，terminal 下常驻），保留引擎原来的行，加一个 `display: "none"` 的 Button（`action: "theme:editCustom"`）。README 的 keybinding 片段改为 `"ctrl+x ctrl+f": "theme:editCustom"`。`/autoscroll` 命令保留（手打用）。版本 0.2.0。
- **为什么：** `command:` 绑定一定走 submit，submit 一定 repin（F-004），插件改不了；Button action 是唯一不走 submit 的按键入口（F-005）。挂 `PromptHint` 而不是 `AbovePrompt`：band 会画 `[-]`，hint 行不会多出可见内容。
- **备选：** `AbovePrompt` band 里放可见按钮（多一行 UI）；继续用 `command:` 只修 ON→OFF 以外的情况（不解决问题）；给 Anthropic 提需求：插件命令支持 `keepsScrollPosition`，或插件可以注册自己的 keybinding action。
- **代价：** keybindings.json 里写的是一个看起来不相关的 action 名；如果引擎以后在 Chat context 给 `theme:editCustom` 加 handler，chord 会被引擎抢走。
- **何时重新考虑：** Claude Code 支持插件命令保持滚动位置、或插件自定义 keybinding action 时，改回语义正确的绑定。
