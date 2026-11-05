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
    return { value: { exitCode: 0, stdout: 'autoScrollEnabled=true\n', stderr: '' } }
  })
  await $.command.run(input('on'))
  expect(runs.length).toBe(1)
  expect(runs[0][0]).toBe('python3')
  expect(runs[0][1].endsWith('/scripts/toggle-autoscroll.py')).toBe(true)
  expect(runs[0][2]).toBe('on')
})
