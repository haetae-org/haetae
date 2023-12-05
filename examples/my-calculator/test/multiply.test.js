import multiply from '../src/multiply.js'

describe('multiply()', () => {
  test('basic usage', () => {
    expect(multiply(1, 1)).toBe(1)
    expect(multiply(2, 4)).toBe(8)
    expect(multiply(3, 3)).toBe(9)
  })
})
