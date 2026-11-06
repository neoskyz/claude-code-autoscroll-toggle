# 研究结论登记（Findings）

> 规则：编号只增不改。状态 `成立` / `已推翻` / `待验证`。被推翻的条目不删，改为 `已推翻` 并链接到新条目。
> 决策见 [decisions.md](decisions.md)，待办见 [todo.md](todo.md)。

---

### F-001 插件不能提供 keybindings

- **状态：** 成立
- **日期：** 2026-11-04
- **证据：** [Add components to a plugin](https://code.claude.com/docs/en/plugins/components) 列出的组件：skills、commands、agents、hooks / mods、MCP、LSP、monitors、output styles、themes、channels、`bin/`、`settings.json`（只认 `agent` 和 `subagentStatusLine`）。没有 keybindings。
- **影响：** D-003。

### F-002 mod 通过 `$.plugin.root` 拿到插件目录

- **状态：** 成立
- **日期：** 2026-11-04
- **证据：** [Mods reference](https://code.claude.com/docs/en/plugins/mods/reference) 的 `$.plugin` 行：`name`、`root`；类型声明里 `root: string`，即插件根目录的绝对路径（`.claude-plugin/` 所在目录）。`claude plugin test` 里实测解析为 `<repo>/plugins/autoscroll-toggle/scripts/toggle-autoscroll.py`。
- **影响：** D-002。

### F-003 同名插件 / 同名命令同时加载会冲突

- **状态：** 成立（文档）
- **日期：** 2026-11-04
- **证据：** 两个同名插件只有一个的 `hooks/hooks.json` 生效（[loading](https://code.claude.com/docs/en/plugins/loading)）；`$.command.register` 对已占用的名字会 throw。
- **影响：** 本机已有 skills-dir 副本，在本机从 marketplace 安装前要先删掉 `~/.claude/skills/autoscroll-toggle/`（T-001）。

### F-004 `command:` 快捷键 = 一次 submit，submit 会把视图拉回底部（跳动的根因）

- **状态：** 成立
- **日期：** 2026-11-05
- **证据：** 读 v2.1.319 bundle：`command:xxx` 绑定调用 `onSubmit("/xxx", ..., {fromKeybinding: true})`，和按 Enter 走同一条路。`onSubmit` 开头无条件 `repin(false, "onSubmit")`，只有内置 `local-jsx` 且 `keepsScrollPosition: true` 的命令（目前只有 `/btw`）例外；插件命令没有这个字段。`repin` 在 `autoScrollEnabled` 为 false 时直接 return。所以：开着 Auto-scroll 时按键关掉，repin 发生在命令执行之前（还是 ON）→ 跳到底部；从 OFF 打开时 repin 被跳过 → 不跳。`immediate` 不影响这一点。
- **实测：** tmux + `CLAUDE_CODE_NO_FLICKER=1`，往上翻到 line-85，`command:autoscroll` 的 chord → 视图跳到 line-119..150（底部）。
- **影响：** D-004。

### F-005 mod 的 Button 可以被一个引擎 keybinding action 的 chord 直接按下，不经过 submit

- **状态：** 成立
- **日期：** 2026-11-05
- **证据：** mods 类型声明 `Button.action`："An engine keybinding action whose chord, as the person bound it, presses this from the prompt"；条件：Button 已挂载、没有 dialog、没有引擎自己的该 action handler 挂载（插件 handler 以 `fallback: true` 注册）。插件不能定义新 action，只能借用引擎列表里的（`app:interrupt` / `app:exit` 被拒）。`display: "none"` 的 Box 里的 Button 仍然挂载、仍然响应。`theme:editCustom` 只在 `ThemePicker` context 有引擎 handler，Chat 里没有。
- **实测：** 同上环境，`ctrl+x ctrl+f` → `theme:editCustom`：OFF 和 ON 两个方向视图都停在 line-85，toast 正常，settings.json 正确翻转；`!sleep 8` 运行中按也一样。
- **影响：** D-004。
