import { expect, it } from 'vitest'
import type { Ref, TransitionProps } from 'vue'
import { isRef, ref } from 'vue'
import { mergeConfig } from '../src/utils'
import type { VusecConfig } from '../src/type'

it('mergeConfig func.', () => {
  const baseConfig: VusecConfig = { visible: true, transition: { name: 'fade', mode: 'out-in' } }

  const transitionRefProps = ref<TransitionProps>({ name: 'fade-in' })
  const userConfig: VusecConfig = { visible: false, transition: transitionRefProps }

  const finalConfig = mergeConfig(baseConfig, userConfig)

  expect(finalConfig.visible).toBe(false)
  expect(isRef(finalConfig.transition)).toBe(true)
  // eslint-disable-next-line vue/no-ref-as-operand
  expect(finalConfig.transition === transitionRefProps).toBe(true)
  expect((finalConfig.transition as Ref<TransitionProps>).value.name).toBe('fade-in')
  transitionRefProps.value.name = 'fade-in-ease'
  expect((finalConfig.transition as Ref<TransitionProps>).value.name).toBe('fade-in-ease')
})
