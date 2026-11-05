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
