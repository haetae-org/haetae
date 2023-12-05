import add from '../src/add.js'

describe('add()', () => {
  test('basic usage', () => {
    expect(add(1, 2)).toBe(3)
    expect(add(4, 2)).toBe(6)
    expect(add(12, 5)).toBe(17)
  })
})
