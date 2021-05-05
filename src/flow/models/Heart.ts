import { isArr, Subscribable } from '@formily/shared'
import { LifeCycle } from './LifeCycle'

export interface IHeartProps<Context> {
  lifecycles?: LifeCycle[]
  context: Context
}

export class Heart<Payload = any, Context = any> extends Subscribable {
  lifecycles: LifeCycle<Payload>[]
  outerLifecycles: Map<any, LifeCycle<Payload>[]> = new Map()

  context: Context

  constructor({ lifecycles = [], context }: IHeartProps<Context>) {
    super()
    this.lifecycles = lifecycles
    this.context = context
  }

  buildLifeCycles = (lifecycles: LifeCycle[]): LifeCycle[] => {
    return lifecycles.reduce((buf, item) => {
      if (item instanceof LifeCycle) {
        return buf.concat(item)
      } else {
        if (isArr(item)) {
          return this.buildLifeCycles(item)
        } else if (typeof item === 'object') {
          this.context = item
          return buf
        }
        return buf
      }
    }, [] as LifeCycle[])
  }

  addLifeCycles = (id: any, lifecycles: LifeCycle[] = []) => {
    this.outerLifecycles.set(id, this.buildLifeCycles(lifecycles))
  }

  hasLifeCycles = (id: any) => {
    return this.outerLifecycles.has(id)
  }

  removeLifeCycles = (id: any) => {
    this.outerLifecycles.delete(id)
  }

  setLifeCycles = (lifecycles: LifeCycle[] = []) => {
    this.lifecycles = this.buildLifeCycles(lifecycles)
  }

  publish = (type: string, payload: Payload, context?: Context) => {
    if (typeof type === 'string') {
      this.lifecycles.forEach((lifecycle) => {
        lifecycle.notify(type, payload, context || this.context)
      })
      this.outerLifecycles.forEach((lifecycles) => {
        lifecycles.forEach((lifecycle) => {
          lifecycle.notify(type, payload, context || this.context)
        })
      })
      this.notify({
        type,
        payload,
      })
    }
  }

  clear = () => {
    this.lifecycles = []
    this.unsubscribe()
  }
}