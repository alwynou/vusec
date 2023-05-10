import { vusec } from 'src/vusec'
import { expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

const BasicComponent = defineComponent({
  props: {
    message: String,
  },
  setup(props, { expose }) {
    expose({ exposeMsg: 'expose message', props })
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

it('replacement mode should work.', async () => {
  const useComp = vusec(BasicComponent, { replacement: true })

  const compRef = ref<InstanceType<typeof BasicComponent>>()

  const { visible, toggle, Replacement } = useComp({ ref: compRef, message: 'hello' })

  expect(Replacement).toBeTypeOf('object')
  const wrapper = mount({
    setup() {
      return () => {
        return h(Replacement, { message: 'hello world' })
      }
    },
  })
  expect(visible.value).toBe(false)
  expect(compRef.value).toMatchInlineSnapshot(`
    {
      "exposeMsg": "expose message",
      "props": {
        "message": "hello world",
      },
    }
  `)
  toggle()
  expect(visible.value).toBe(true)
  await nextTick()
  expect(compRef.value).toBeTypeOf('object')
  expect(wrapper.text()).toBe('hello world')
})
