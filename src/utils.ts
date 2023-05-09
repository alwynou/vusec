import { isRef, unref } from 'vue'

export function mergeConfig<T extends Record<any, any>>(...objs: T[]): T {
  const ret = {} as T
  for (let index = 0; index < objs.length; index++) {
    const curObj = objs[index]

    if (!curObj || !isObject(curObj))
      continue

    for (const key in curObj) {
      const value = curObj[key]
      if (key in ret && isObject(ret[key])) {
        const oldValue = ret[key]
        if (isRef(value)) {
          value.value = isObject(unref(value)) ? (mergeConfig(unref(oldValue), unref(value))) : unref(value)
          ret[key] = value
        }
        else {
          ret[key] = mergeConfig(oldValue, value)
        }
      }
      else {
        ret[key] = value
      }
    }
  }

  return ret
}

export function isObject(obj: unknown): obj is object {
  return Object.prototype.toString.call(obj) === '[object Object]'
}
