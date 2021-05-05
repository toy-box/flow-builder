import { batch } from '@formily/reactive'
import { FlowGraph } from '../models'
import { LifeCycleTypes } from '../types'
import { createEffectHook } from '../shared'

function createGraphEffect(type: LifeCycleTypes) {
  return createEffectHook(
    type,
    (flowGraph: FlowGraph) => (callback: (flowGraph: FlowGraph) => void) => {
      batch(() => {
        callback(flowGraph)
      })
    }
  )
}

export const onFlowGraphInit = createGraphEffect(LifeCycleTypes.ON_FLOW_GRAPH_INIT)
export const onFlowGraphMount = createGraphEffect(LifeCycleTypes.ON_FLOW_GRAPH_MOUNT)
export const onFlowGraphEditable = createGraphEffect(LifeCycleTypes.ON_FLOW_GRAPH_EDITABLE)
