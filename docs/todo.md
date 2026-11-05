# 待办（唯一的待办清单）

> 规则：每条一个编号 T-xxx（只增不改），一行说明 + 加入日期 + 相关链接。
> 提出 → Backlog；用户批准 → 已批准未开始；开工 → 进行中；做完 → 最近完成（只留最近约 15 条）。
> 需要用户拍板的事放"待你决定"，决定后移走，并在 [decisions.md](decisions.md) 记一条。

## 待你决定

- **T-001** 本机是否改用 marketplace 安装：删掉 `~/.claude/skills/autoscroll-toggle/` 和 `~/.claude/bin/toggle-autoscroll.py`，改为 `/plugin install autoscroll-toggle@neoskyz`。两份同时存在会重复注册 `/autoscroll`（F-003）。（2026-11-04）
- **T-002** 仓库是否改为 public（现在是 private，别人装不了）。（2026-11-04）

## 进行中

（暂无）

## 已批准未开始

（暂无）

## Backlog（未批准的想法）

- **T-003** 加 `.claude-plugin/icon.png`（提交官方目录时需要）。（2026-11-04）
- **T-004** 提交到 Anthropic plugin directory。触发：public 之后。（2026-11-04）

## 最近完成

- 2026-11-04 打包成独立 GitHub 仓库 + marketplace，fallback 脚本内置，加测试。
