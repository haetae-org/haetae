import exponent from '../src/exponent.js'

describe('exponent()', () => {
  test('basic usage', () => {
    expect(exponent(0, 2)).toBe(0)
    expect(exponent(1, 3)).toBe(1)
    expect(exponent(2, 4)).toBe(16)
  })
})
