import { configure } from 'haetae'

export default configure({
  commands: {
    helloworld: {
      run: () => ({ hello: 'world' }),
    },
    hi: {
      env: {
        foo: 'bar',
      },
      run: () => console.log('hi!'),
    },
  },
})
