import { Edge, Node } from "@antv/x6"
import { AutoFlow } from "./models"
import { IFieldMeta, ICompareOperation } from '@toy-box/meta-schema';

export type AnyFunction = (...args: any[]) => any

export type FlowGraphEffects = (flowGraph: AutoFlow) => void
export interface FlowGraphMeta {
  id: string
  name: string
  flow: FlowMeta
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
  VARIABLE_ARRAY = 'variable_array',
  VARIABLE_ARRAY_RECORD = 'variable_array_record',
  CONSTANT = 'constant',
  FORMULA = 'formula',
  TEMPLATE = 'template'
}

export interface FlowMeta {
  [IFlowResourceType.VARIABLE]?: IFieldMeta[]
  [IFlowResourceType.CONSTANT]?: IFieldMeta[]
  [IFlowResourceType.FORMULA]?: IFieldMeta[]
  [IFlowResourceType.TEMPLATE]?: IFieldMeta[]
  start?: FlowMetaParam
  assignments?: FlowMetaParam[]
  decisions?: FlowMetaParam[]
  loops?: FlowMetaParam[]
  sortCollectionProcessor?: FlowEdgeMeta[]
  recordCreates?: FlowMetaParam[]
  recordUpdates?: FlowMetaParam[]
  recordDeletes?: FlowMetaParam[]
  recordLookups?: FlowMetaParam[]
}

export enum FlowMetaTypes {
  START = 'start',
  ASSIGNMENTS = 'assignments',
  DECISIONS = 'decisions',
  SUSPENDS= 'suspends',
  LOOPS = 'loops',
  SORT_COLLECTION_PROCESSOR = 'sortCollectionProcessor',
  RECORD_CREATES = 'recordCreates',
  RECORD_UPDATES = 'recordUpdates',
  RECORD_DELETES = 'recordDeletes',
  RECORD_LOOKUPS = 'recordLookups'
}

export interface FlowMetaParam {
  id: string
  name: string
  description?: string
  connector?: {
    targetReference: string | null
  }
  defaultConnector?: {
    targetReference: string | null
  }
  nextValueConnector?: {
    targetReference: string | null
  }
  defaultConnectorName?: string
  assignmentItems?: ICompareOperation[]
  rules?: FlowMetaParam[]
  collectionReference?: string
  iterationOrder?: string
  limit?: null | number
  sortOptions?: SortOption[]
  registerId?: string
  inputAssignments?: ICompareOperation[]
  storeOutputAutomatically?: boolean
  assignRecordIdToReference?: string
  criteria?: {
    conditions: ICompareOperation[]
  }
  outputAssignments?: ICompareOperation[]
  outputReference?: null | string
  queriedFields?: string[]
  sortOrder?: SortOrder
  sortField?: string
  getFirstRecordOnly?: boolean
}

export interface SortOption {
  sortField: null | string
  sortOrder: SortOrder
  doesPutEmptyStringAndNullFirst: boolean
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
  NULL = 'null'
}