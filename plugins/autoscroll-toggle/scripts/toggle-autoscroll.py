#!/usr/bin/env python3
"""Flip `autoScrollEnabled` in Claude Code's user settings.json (missing = true).

Usage: toggle-autoscroll.py [on|off]   (no arg = toggle)
Prints the new state: "autoScrollEnabled=true" or "autoScrollEnabled=false".

The settings file is $CLAUDE_CONFIG_DIR/settings.json, or ~/.claude/settings.json
when CLAUDE_CONFIG_DIR is unset. Only that one key is touched; other keys and
their order are preserved. Standard library only.
"""
import json
import os
import sys
import tempfile


def settings_path() -> str:
    config_dir = os.environ.get("CLAUDE_CONFIG_DIR") or os.path.expanduser("~/.claude")
    return os.path.join(config_dir, "settings.json")


def main() -> int:
    path = settings_path()
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        data = {}
    if not isinstance(data, dict):
        print(f"{path} does not hold a JSON object", file=sys.stderr)
        return 1

    current = data.get("autoScrollEnabled", True)
    arg = sys.argv[1].lower() if len(sys.argv) > 1 else ""
    if arg in ("on", "true", "1"):
        new = True
    elif arg in ("off", "false", "0"):
        new = False
    elif arg == "":
        new = not current
    else:
        print(f"unknown arg: {arg!r} (use on|off or nothing)", file=sys.stderr)
        return 2

    data["autoScrollEnabled"] = new
    text = json.dumps(data, indent=2, ensure_ascii=False) + "\n"

    # Atomic write in the same directory, keeping the original file mode.
    directory = os.path.dirname(path)
    os.makedirs(directory, exist_ok=True)
    mode = os.stat(path).st_mode & 0o777 if os.path.exists(path) else 0o600
    fd, tmp = tempfile.mkstemp(dir=directory, prefix=".settings.", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(text)
        os.chmod(tmp, mode)
        os.replace(tmp, path)
    except BaseException:
        if os.path.exists(tmp):
            os.unlink(tmp)
        raise

    print(f"autoScrollEnabled={'true' if new else 'false'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
