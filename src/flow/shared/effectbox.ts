import { isFn, isValid } from '@formily/shared'
import { FlowGraph, LifeCycle } from '../models'
import { isFlowGraph } from '../shared/checkers'
import { AnyFunction } from '../types'

const FlowGraphEffectState: {
  lifecycles: LifeCycle[]
  context: any[]
  effectStart: boolean
  effectEnd: boolean
} = {
  lifecycles: [],
  context: [],
  effectStart: false,
  effectEnd: false,
}

export const createEffectHook = <
  F extends (payload: any, ...ctxs: any[]) => AnyFunction
>(
  type: string,
  callback?: F
) => {
  return (...args: Parameters<ReturnType<F>>) => {
    if (FlowGraphEffectState.effectStart) {
      FlowGraphEffectState.lifecycles.push(
        new LifeCycle(type, (payload, ctx) => {
          if (isFn(callback)) {
            callback(payload, ctx, ...FlowGraphEffectState.context)(...args)
          }
        })
      )
    } else {
      throw new Error(
        'Effect hooks cannot be used in asynchronous function body'
      )
    }
  }
}

export const createEffectContext = <T = any>(defaultValue?: T) => {
  let index: number
  return {
    provide(value?: T) {
      if (FlowGraphEffectState.effectStart) {
        index = FlowGraphEffectState.context.length
        FlowGraphEffectState.context[index] = isValid(value) ? value : defaultValue
      } else {
        throw new Error(
          'Provide method cannot be used in asynchronous function body'
        )
      }
    },
    consume(): T {
      if (!FlowGraphEffectState.effectStart) {
        throw new Error(
          'Consume method cannot be used in asynchronous function body'
        )
      }
      return FlowGraphEffectState.context[index]
    },
  }
}

const FlowGraphEffectContext = createEffectContext<FlowGraph>()

export const useEffectFlowGraph = FlowGraphEffectContext.consume

export const runEffects = <Context>(
  context: Context,
  ...args: ((context: Context) => void)[]
): LifeCycle[] => {
  FlowGraphEffectState.lifecycles = []
  FlowGraphEffectState.context = []
  FlowGraphEffectState.effectStart = true
  FlowGraphEffectState.effectEnd = false
  if (isFlowGraph(context)) {
    FlowGraphEffectContext.provide(context as unknown as any)
  }
  args.forEach((effects) => {
    if (isFn(effects)) {
      effects(context)
    }
  })
  FlowGraphEffectState.context = []
  FlowGraphEffectState.effectStart = false
  FlowGraphEffectState.effectEnd = true
  return FlowGraphEffectState.lifecycles
}
