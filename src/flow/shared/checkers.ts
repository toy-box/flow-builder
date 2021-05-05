import { instOf } from '@formily/shared'
import { FlowGraph } from '../models'

export const isFlowGraph = (node: any): node is FlowGraph => {
  return instOf(node, FlowGraph)
}