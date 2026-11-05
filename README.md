# claude-code-autoscroll-toggle

A tiny Claude Code plugin (a "mod") that adds one command:

```
/autoscroll          toggle Auto-scroll
/autoscroll on       turn it on
/autoscroll off      turn it off
```

## Why

In [fullscreen rendering](https://code.claude.com/docs/en/fullscreen), Claude Code's **Auto-scroll** setting keeps the transcript pinned to the newest output. That is great while you watch a turn stream, and annoying when you want to scroll back and read something while Claude keeps working: every new line pulls you down again.

The only built-in switch is a row in `/config`, which takes several keystrokes and a menu each time. This plugin makes it one command (or one key chord), and it runs instantly:

- it is registered as `immediate`, so it works while Claude is busy;
- it costs no model turn and prints nothing into the transcript, so Claude never reads it;
- you get a small toast: `Auto-scroll ON` / `Auto-scroll OFF`.

## Install

Inside Claude Code:

```
/plugin marketplace add neoskyz/claude-code-autoscroll-toggle
/plugin install autoscroll-toggle@neoskyz
```

Or from your shell:

```bash
claude plugin marketplace add neoskyz/claude-code-autoscroll-toggle
claude plugin install autoscroll-toggle@neoskyz
```

Then start a new session (or run `/reload-plugins`). `/autoscroll` shows up in the `/` command list.

## Optional: a key chord

Plugins cannot ship keybindings, so add one yourself in `~/.claude/keybindings.json` ([docs](https://code.claude.com/docs/en/keybindings)). This binds `Ctrl+X Ctrl+F` ("follow") in the chat input:

```json
{
  "$schema": "https://www.schemastore.org/claude-code-keybindings.json",
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+x ctrl+f": "command:autoscroll"
      }
    }
  ]
}
```

If the file already has a `bindings` array, add the `Chat` entry to it instead of replacing the file.

## How it works

The plugin is a [mod](https://code.claude.com/docs/en/plugins/mods/overview): a hooks module, [`hooks/register.ts`](plugins/autoscroll-toggle/hooks/register.ts), that Claude Code loads directly (no build step).

1. On `session.start` it registers `/autoscroll` with `$.command.register`.
2. On `command.run` it looks up the Auto-scroll row with `$.config.list()` and flips it with `$.config.set()`, exactly as the `/config` menu does. The change applies to the running session and is saved to your user settings.
3. If that path is unavailable or refused, it falls back to the bundled script [`scripts/toggle-autoscroll.py`](plugins/autoscroll-toggle/scripts/toggle-autoscroll.py), which flips `autoScrollEnabled` in `~/.claude/settings.json` (or `$CLAUDE_CONFIG_DIR/settings.json`) with an atomic write. Claude Code's settings watcher picks the change up.

The script only touches that one key and uses the Python standard library.

## Requirements

- Claude Code with mods support (v2.1.287 or later). Tested with **v2.1.318** on macOS. The mods API can change between releases.
- Fullscreen rendering, since that is where Auto-scroll applies.
- `python3` on your `PATH`, only for the fallback path.

## Development

```bash
claude plugin validate .                          # marketplace
claude plugin validate ./plugins/autoscroll-toggle # plugin + hooks module
claude plugin test ./plugins/autoscroll-toggle     # mod tests
claude --plugin-dir ./plugins/autoscroll-toggle    # try it in a session
```

## Uninstall

```
/plugin uninstall autoscroll-toggle@neoskyz
/plugin marketplace remove neoskyz
```

Removing the marketplace also uninstalls its plugins. Your `autoScrollEnabled` setting stays at whatever it was last set to; flip it back in `/config` if needed.

## License

[MIT](LICENSE)
