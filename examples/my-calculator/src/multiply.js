import add from './add.js'

export default function multiply(a, b) {
  let agg = 0
  for (let i = 0; i < b; i += 1) {
    agg = add(agg, a)
  }

  return agg // === a * b
}
