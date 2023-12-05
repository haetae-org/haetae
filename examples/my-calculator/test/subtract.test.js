import subtract from '../src/subtract.js'

describe('subtract()', () => {
  test('basic usage', () => {
    expect(subtract(1, 2)).toBe(-1)
    expect(subtract(4, 2)).toBe(2)
    expect(subtract(12, 5)).toBe(7)
  })
})
