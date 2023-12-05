import multiply from './multiply.js'

export default function exponent(a, b) {
  let agg = 1
  for (let i = 0; i < b; i += 1) {
    agg = multiply(agg, a)
  }

  return agg // === a^b
}
