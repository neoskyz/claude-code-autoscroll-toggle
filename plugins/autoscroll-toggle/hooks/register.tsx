import type { EngineInterface, Register } from 'claude-code'

// Two ways to flip the fullscreen "Auto-scroll" setting:
//
// 1. The key chord (recommended). Bind a chord to KEY_ACTION in keybindings.json.
//    A hidden Button drawn under the prompt hint line names that action, so the
//    chord presses the Button directly: no prompt is submitted, so the view
//    stays where it is. (A `command:autoscroll` binding submits `/autoscroll`
//    like Enter does, and every submit re-pins the transcript to the bottom
//    while Auto-scroll is still on: that was the jump.)
// 2. /autoscroll [on|off], typed. Works, but typing a command is a submit too,
//    so turning it off that way scrolls to the bottom once.
//
// Flipping goes through $.config.set (the /config row, applied live and saved to
// user settings), with scripts/toggle-autoscroll.py as a fallback.

// An engine keybinding action that no engine handler serves in the Chat
// context (the engine only handles it inside the /theme picker), so the
// person's chord for it reaches our Button. Plugins cannot define actions.
const KEY_ACTION = 'theme:editCustom'

function wanted(args: string, current: boolean): boolean | undefined {
  const a = args.trim().toLowerCase()
  if (a === '') return !current
  if (a === 'on' || a === 'true' || a === '1') return true
  if (a === 'off' || a === 'false' || a === '0') return false
  return undefined
}

async function toggle($: EngineInterface, args: string): Promise<void> {
  // Path 1: the /config row
  try {
    const rows = await $.config.list()
    const row = rows.find(
      r => r.key === 'autoScroll' || /auto-?scroll/i.test(r.label),
    )
    if (row && row.kind === 'boolean') {
      const target = wanted(args, row.value === true)
      if (target === undefined) {
        $.ui.toast('usage: /autoscroll [on|off]')
        return
      }
      const res = await $.config.set({ key: row.key, value: target })
      if (!res.deny) {
        $.ui.toast('Auto-scroll ' + (target ? 'ON' : 'OFF'))
        return
      }
      $.ui.log('config.set refused (' + res.deny + '), falling back to script')
    }
  } catch (err) {
    $.ui.log('config path failed (' + String(err) + '), falling back to script')
  }

  // Path 2: the script bundled with this plugin
  try {
    const argv = ['python3', $.plugin.root + '/scripts/toggle-autoscroll.py']
    const a = args.trim()
    if (a) argv.push(a)
    const out = await $.process.run(argv)
    if (out.exitCode === 0) {
      const isOn = out.stdout.includes('=true')
      $.ui.toast('Auto-scroll ' + (isOn ? 'ON' : 'OFF') + ' (via settings.json)')
    } else {
      $.ui.toast('autoscroll toggle failed: ' + (out.stderr || out.stdout).trim())
    }
  } catch (err) {
    $.ui.toast('autoscroll toggle failed: ' + String(err))
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    try {
      await $.command.register({
        name: 'autoscroll',
        description: 'Toggle Auto-scroll (follow new output) in fullscreen; or /autoscroll on|off',
        argumentHint: '[on|off]',
        immediate: true,
      })
    } catch (err) {
      $.ui.log('could not register /autoscroll: ' + String(err))
    }
    return next(e)
  })

  on('command.run', { command: 'autoscroll' }, async ($, e) => {
    await toggle($, e.args)
    return {}
  })

  // The hint line under the prompt is always mounted in the terminal, so the
  // hidden Button (and with it the chord) is live whenever the prompt is.
  on('ui.render', { component: 'PromptHint' }, async ($, e, next) => {
    const engine = await next(e)
    if (e.surface !== 'terminal') return engine
    const { Box, Button } = $.ui.resolve(e)
    return (
      <Box>
        {engine}
        <Box display="none">
          <Button
            key="autoscroll-toggle"
            label="Toggle Auto-scroll"
            action={KEY_ACTION}
            onPress={() => {
              void toggle($, '')
            }}
          />
        </Box>
      </Box>
    )
  })
}
