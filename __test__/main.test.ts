import { vusec } from 'src/vusec'
import { expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'

const BasicComponent = defineComponent({
  props: {
    message: String,
  },
  setup(props, { expose }) {
    expose({ exposeMsg: 'expose message' })
    return () => h('span', props.message)
  },
})

it('basic should work.', async () => {
  const useComp = vusec(BasicComponent, { replacement: false })

  const compRef = ref<InstanceType<typeof BasicComponent>>()

  const { visible, toggle, Replacement } = useComp({ ref: compRef, message: 'hello' })

  expect(Replacement).toBeTypeOf('symbol')
  expect(visible.value).toBe(false)
  expect(compRef.value).toBeTypeOf('undefined')
  toggle()
  expect(visible.value).toBe(true)
  await nextTick()
  expect(compRef.value).toBeTypeOf('object')
  expect((compRef.value?.$el as HTMLElement).textContent).toBe('hello')
})
