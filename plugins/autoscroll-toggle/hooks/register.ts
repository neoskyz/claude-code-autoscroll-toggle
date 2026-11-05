import type { Register } from 'claude-code'

// /autoscroll [on|off]  -- no argument toggles.
// Path 1: flip the /config "Auto-scroll" row through $.config.set, exactly as the
//         menu does (applies to the running session and persists to user settings).
// Path 2 (fallback): run scripts/toggle-autoscroll.py from this plugin, which edits
//         the user settings.json; Claude Code's settings watcher picks it up.
// Returns {} so nothing is printed to the transcript and the model reads nothing.

function wanted(args: string, current: boolean): boolean | undefined {
  const a = args.trim().toLowerCase()
  if (a === '') return !current
  if (a === 'on' || a === 'true' || a === '1') return true
  if (a === 'off' || a === 'false' || a === '0') return false
  return undefined
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
    // Path 1: the /config row
    try {
      const rows = await $.config.list()
      const row = rows.find(
        r => r.key === 'autoScroll' || /auto-?scroll/i.test(r.label),
      )
      if (row && row.kind === 'boolean') {
        const target = wanted(e.args, row.value === true)
        if (target === undefined) {
          $.ui.toast('usage: /autoscroll [on|off]')
          return {}
        }
        const res = await $.config.set({ key: row.key, value: target })
        if (!res.deny) {
          $.ui.toast('Auto-scroll ' + (target ? 'ON' : 'OFF'))
          return {}
        }
        $.ui.log('config.set refused (' + res.deny + '), falling back to script')
      }
    } catch (err) {
      $.ui.log('config path failed (' + String(err) + '), falling back to script')
    }

    // Path 2: the script bundled with this plugin
    try {
      const argv = ['python3', $.plugin.root + '/scripts/toggle-autoscroll.py']
      const a = e.args.trim()
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
    return {}
  })
}
