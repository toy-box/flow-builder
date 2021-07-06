import { Edge, Node } from "@antv/x6"
import { FlowGraph } from "./models"

export type AnyFunction = (...args: any[]) => any

export type FlowGraphEffects = (flowGraph: FlowGraph) => void
export interface FlowGraphMeta {
  id: string
  name: string
  nodes: FlowNodeMeta[]
}

export interface FlowNodeMeta {
  id: string
  name: string
  type: string
  inFlowSize: number
  outFlowSize: number
  nodeMeta: Node.Metadata
}

export interface FlowNodeProps extends FlowNodeMeta {
  node?: Node<Node.Properties>
}

export interface FlowEdgeMeta {
  id: string
  name: string
  source?: string
  target?: string
  edgeMeta?: Edge.Metadata
}

export interface FlowEdgeProps extends FlowEdgeMeta {
  edge: Edge<Edge.Properties>
}

export enum LifeCycleTypes {
  ON_FLOW_GRAPH_INIT = 'onFlowGraphInit',
  ON_FLOW_GRAPH_INIT_CHANGE = 'onFlowGraphInitChange',

  ON_FLOW_GRAPH_MOUNT = 'onFlowGraphMount',
  ON_FLOW_GRAPH_UMOUNT = 'onFlowGraphUnmount',

  ON_FLOW_GRAPH_EDITABLE = 'onFlowGraphEditable',

  ON_PROCESS_DRAGING = 'onProcessDraging',
  ON_PROCESS_DROPING = 'onProcessDroping',

  ON_NODE_CHANGE = 'onNodeChange',

  ON_FLOW_ADD_START = 'onFlowAddStart',
  ON_FLOW_ADD_END = 'onFlowAddEnd',
  ON_FLOW_REMOVE_START = 'onFlowRemoveStart',
  ON_FLOW_REMOVE_END = 'onFlowRemoveENd',
}

export enum processTypes {
  ASSIGNMENT = 'assignment',
}

export type LifeCycleHandler<T> = (payload: T, context: any) => void

export type LifeCyclePayload<T> = (
  params: {
    type: string
    payload: T
  },
  context: any
) => void

export enum IFlowResourceType {
  VARIABLE = 'variable',
  CONSTANT = 'constant',
  FORMULA = 'formula',
  TEMPLATE = 'template'
}