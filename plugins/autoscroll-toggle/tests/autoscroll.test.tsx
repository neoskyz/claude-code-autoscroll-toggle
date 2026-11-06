import type { CommandRunInput, ConfigRow } from 'claude-code'
import { expect, test } from 'claude-code/testing'

const ROW: Omit<ConfigRow, 'value'> = {
  key: 'autoScroll',
  label: 'Auto-scroll',
  kind: 'boolean',
  isLocked: false,
  provider: { plugin: 'engine', tier: 'core' },
}

// The engine fills in origin and presentation, as in the docs' own examples.
const input = (args: string) => ({ command: 'autoscroll', args }) as CommandRunInput

test('/autoscroll with no argument flips the /config row', async ($, on) => {
  const sets: unknown[] = []
  on('config.list', () => ({ value: [{ ...ROW, value: true }] }))
  on('config.set', (_$, e) => {
    sets.push(e.value)
    return { value: e.value }
  })
  const res = await $.command.run(input(''))
  expect(res).toEqual({})
  expect(sets).toEqual([false])
})

test('/autoscroll on|off sets the row explicitly', async ($, on) => {
  const sets: unknown[] = []
  on('config.list', () => ({ value: [{ ...ROW, value: true }] }))
  on('config.set', (_$, e) => {
    sets.push(e.value)
    return { value: e.value }
  })
  await $.command.run(input('on'))
  await $.command.run(input('OFF'))
  expect(sets).toEqual([true, false])
})

test('a refused config.set falls back to the bundled script', async ($, on) => {
  const runs: (readonly string[])[] = []
  on('config.list', () => ({ value: [{ ...ROW, value: false }] }))
  on('config.set', () => ({ deny: 'test refuses' }))
  on('process.run', (_$, e) => {
    runs.push(e.argv)
    return { value: { exitCode: 0, stdout: 'autoScrollEnabled=true\n', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
  })
  await $.command.run(input('on'))
  expect(runs.length).toBe(1)
  const [exe, script, arg] = runs[0] ?? []
  expect(exe).toBe('python3')
  expect(script?.endsWith('/scripts/toggle-autoscroll.py')).toBe(true)
  expect(arg).toBe('on')
})

const HINT = {
  plugin: 'autoscroll-toggle',
  component: 'PromptHint',
  requestId: 'hint',
  props: { isDraft: false, isWorking: false, hint: '? for shortcuts' },
} as const

test('the hint line keeps the engine line and adds a hidden chord Button', async ($, on) => {
  // This hook stands for the engine's own hint line.
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine hint</Text>
  })
  const ui = await $.ui.mount({ ...HINT, surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /engine hint/ }))?.text).toBe('engine hint')
  const button = await ui.find({ type: 'Button', key: 'autoscroll-toggle' })
  expect(button?.props.action).toBe('theme:editCustom')
  await ui.unmount()
})

test('the chord Button flips the row without submitting a prompt', async ($, on) => {
  const sets: unknown[] = []
  const submits: unknown[] = []
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine hint</Text>
  })
  on('config.list', () => ({ value: [{ ...ROW, value: true }] }))
  on('config.set', (_$, e) => {
    sets.push(e.value)
    return { value: e.value }
  })
  on('prompt.submit', (_$, e) => {
    submits.push(e)
    return { drop: 'test' }
  })
  const ui = await $.ui.mount({ ...HINT, surface: 'terminal' })
  await ui.press({ key: 'autoscroll-toggle' })
  expect(sets).toEqual([false])
  expect(submits).toEqual([])
  await ui.unmount()
})

test('other surfaces get the engine hint line untouched', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine hint</Text>
  })
  const ui = await $.ui.mount({ ...HINT, surface: 'desktop' })
  expect(await ui.find({ type: 'Button' })).toBe(undefined)
  await ui.unmount()
})
