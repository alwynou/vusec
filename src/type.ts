import type {
  ComputedRef,
  DefineComponent,
  EmitsOptions,
  ExtractPropTypes,
  FunctionalComponent,
  Ref,
  TransitionProps,
  VNode,
  VNodeProps,
} from 'vue'

// ==============================
// component arg type
// ==============================
export interface NormalComponent<T = any> {
  new (...args: any[]): T
}
export type FuncComponent<P = any, E extends EmitsOptions = any> = FunctionalComponent<P, E>
export type ComponentType = NormalComponent | FunctionalComponent<any, any>

// ==============================
// config type
// ==============================

export interface VusecConfig {
  /**
   * visible initial value
   *
   * @default false
   */
  visible?: boolean
  /**
   * Component display mode
   *
   * @default 'v-show'
   */
  display?: 'v-if' | 'v-show'
  /**
   * `<Transition/>` component props
   */
  transition?: MaybeRef<TransitionProps>

  /**
   * Expose a component(named 'Replacement') allow for setting of the component's mounting position.
   *
   * @default false
   */
  replacement?: boolean

  /**
   * Component mounting position
   *
   * Applies if `replacement` option is false
   *
   * @default document.body
   */
  appendTo?: MaybeRef<HTMLElement | undefined>

  /**
   * Index of insertion relative to `appendTo`.
   *
   * @value 'beforebegin' : `appendTo`元素本身的前面。
   * @value 'afterbegin'  : 只`appendTo`元素当中，`appendTo`元素第一个子孩子前面。
   * @value 'beforeend'   : 只`appendTo`元素当中，`appendTo`元素最后一个子孩子后面。
   * @value 'afterend'    : `appendTo`元素本身的后面。
   *
   * @default 'afterend'
   */
  appendPosition?: InsertPosition
}

// ==============================
// return type
// ==============================
type ChildrenRender = (...args: any[]) => VNode | string | VNode[]

export type VusecUseFn<T extends ComponentType, GC extends VusecConfig> = (
  props?: MaybeRef<inferComponentProps<T> & VNodeProps & Record<any, any>>,
  children?: null | Record<string, ChildrenRender> | ChildrenRender,
  config?: VusecConfig
) => VusecUseFnReturn<T, GC>

export interface VusecUseFnReturn<T extends ComponentType, C extends VusecConfig> {
  /** Control display */
  visible: ComputedRef<boolean>
  /** show component */
  show: () => void
  /** hide component */
  hide: () => void
  /** toggle show  component */
  toggle: () => void
  /** Expose Component allow for setting of the component's mounting position */
  Replacement: C extends { replacement: true } ? T : typeof Comment
}

// ==============================
// help type
// ==============================
type MaybeRef<T> = T | Ref<T>

type FunctionalComponentPropTypes<T> = T extends FunctionalComponent<infer P> ? P : Record<any, any>

type RequiredKeys<T> = {
  [K in keyof T]: T[K] extends
  | {
    required: true
  }
  | {
    default: any
  }
  | BooleanConstructor
  | {
    type: BooleanConstructor
  }
    ? T[K] extends {
      default: undefined | (() => undefined)
    }
      ? never
      : K
    : never
}[keyof T]

type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>

type inferComponentProps<T extends ComponentType> = T extends NormalComponent
  ? T extends DefineComponent<infer P, any, any>
    ? P extends {}
      ? MaybeRef<
          {
            [PK in keyof Pick<P, RequiredKeys<P>>]: ExtractPropTypes<P>[PK]
          } & { [PK in keyof Pick<P, OptionalKeys<P>>]?: ExtractPropTypes<P>[PK] }
        >
      : {}
    : {}
  : FunctionalComponentPropTypes<T>
