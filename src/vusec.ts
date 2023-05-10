import type { ComponentInternalInstance, VNode, VNodeProps } from 'vue'
import {
  Comment, Transition,
  computed,
  createVNode,
  defineComponent,
  getCurrentInstance,
  isRef,
  mergeProps,
  nextTick,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  ref,
  render,
  unref,
  vShow,
  watch,
  withDirectives,
} from 'vue'
import type {
  ComponentType,
  FuncComponent,
  NormalComponent,
  VusecConfig,
  VusecUseFn,
  VusecUseFnReturn,
} from './type'
import { isObject, mergeConfig } from './utils'

const defaultConfig: VusecConfig = {
  visible: false,
  display: 'v-show',
  replacement: false,
  appendTo: document.body,
  appendPosition: 'beforeend',
}
export function vusec<T extends FuncComponent, C extends VusecConfig>(
  component: T,
  configGlobal?: C
): VusecUseFn<T, C>
export function vusec<T extends NormalComponent, C extends VusecConfig>(
  component: T,
  configGlobal?: C
): VusecUseFn<T, C>
export function vusec<T extends ComponentType, C extends VusecConfig>(
  component: T,
  configGlobal?: C,
): VusecUseFn<T, C> {
  return function (baseProps, baseChildren, config) {
    const ins = getCurrentInstance()

    const mergedConfig = mergeConfig(defaultConfig, configGlobal!, config!)
    const isManualAppend = !!mergedConfig.replacement

    const visible = ref<boolean>(!!mergedConfig.visible)
    let rootComponentVNode: VNode | null
    let container: HTMLElement | null
    let isMounted = false

    const componentRender = (inheritAttrs: Record<any, any>, children: Record<string, any>) => {
      // v-if
      if (mergedConfig.display === 'v-if') {
        if (unref(visible))
          return createVNode(component as any, mergeProps(unref(baseProps) || {}, inheritAttrs || {}), children)
        return null
      }

      // v-show
      return withDirectives(
        createVNode(component as any, mergeProps(unref(baseProps) || {}, inheritAttrs || {}), children),
        [[vShow, unref(visible)]],
      )
    }

    const createInnerComponent = (wrapInstance: ComponentInternalInstance, baseChildren: Record<string, any>) => {
      const { ref, props, children } = wrapInstance.vnode

      let rawChildren = children || {}
      if (!isObject(rawChildren))
        rawChildren = { default: () => children }

      const mergedChildren: Record<string, any> = { ...baseChildren, ...rawChildren }

      let vnode: VNode | null

      // with transition
      if (unref(mergedConfig.transition)) {
        vnode = createVNode(Transition, unref(mergedConfig.transition) as VNodeProps, () =>
          componentRender(props!, mergedChildren),
        )
      }
      else {
        // default
        vnode = componentRender(props!, mergedChildren)
      }

      if (vnode && (ref as any)?.i)
        vnode.ref = ref

      return vnode
    }

    const InnerComponent = defineComponent({
      setup() {
        const instance = getCurrentInstance()
        const children = typeof baseChildren === 'function' ? { default: baseChildren } : baseChildren ?? {}
        return () => createInnerComponent(instance!, children)
      },
    })

    // auto mounting component
    const mount = () => {
      if (isManualAppend || isMounted) return

      rootComponentVNode = createVNode(InnerComponent, unref(baseProps))

      if (ins?.appContext)
        rootComponentVNode.appContext = ins.appContext

      container = container ?? (document.createElement('span') as unknown as HTMLElement)
      render(rootComponentVNode, container)
      unref(mergedConfig.appendTo)!.insertAdjacentElement(mergedConfig.appendPosition!, container.firstElementChild!)
      isMounted = true
    }
    const unmount = () => {
      if (isManualAppend || !container) return
      container.parentNode?.removeChild(container)
      render(null, container)
      container = rootComponentVNode = null
      isMounted = false
    }

    // utils methods
    const show = () => {
      if (!isManualAppend)
        mount()

      visible.value = true
    }
    const hide = () => {
      visible.value = false
    }
    const toggle = () => {
      unref(visible) ? hide() : show()
    }

    const returnProxy: VusecUseFnReturn<any, any> = {
      show,
      hide,
      toggle,
      visible: computed(() => unref(visible)),
      Replacement: InnerComponent,
    }

    // plug-in mode logic
    if (!isManualAppend) {
      // auto mounting component don't need replacement component
      returnProxy.Replacement = Comment

      if (unref(visible))
        show()

      if (isRef(mergedConfig.appendTo)) {
        watch(mergedConfig.appendTo, () => {
          unmount()
          nextTick(mount)
        })
      }

      if (ins) {
        // sync parent component lifecycle function logic
        let isOpenOnDeactivated = false

        onActivated(() => {
          if (isOpenOnDeactivated) {
            isOpenOnDeactivated = false
            show()
          }
        })
        onDeactivated(() => {
          if (unref(visible)) {
            isOpenOnDeactivated = true
            hide()
          }
        })
        onBeforeUnmount(unmount)
      }
    }

    return returnProxy as any
  }
}
