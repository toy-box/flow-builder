import { Edge, Node } from "@antv/x6"
import { IFieldMeta, ICompareOperation } from '@toy-box/meta-schema';
import { AutoFlow } from "./models/AutoFlow"

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

export type LifeCycleHandler<T> = (payload: T, context: any) => void

export type LifeCyclePayload<T> = (
  params: {
    type: string
    payload: T
  },
  context: any
) => void

export enum IFlowResourceType {
  VARIABLE = 'variables',
  VARIABLE_RECORD = 'variables_record',
  VARIABLE_ARRAY = 'variables_array',
  VARIABLE_ARRAY_RECORD = 'variables_array_record',
  CONSTANT = 'constants',
  FORMULA = 'formulas',
  TEMPLATE = 'templates'
}

export interface FlowMeta {
  [IFlowResourceType.VARIABLE]?: IFieldMeta[]
  [IFlowResourceType.CONSTANT]?: IFieldMeta[]
  [IFlowResourceType.FORMULA]?: IFieldMeta[]
  [IFlowResourceType.TEMPLATE]?: IFieldMeta[]
  start?: FlowMetaParam
  assignments?: FlowMetaParam[]
  decisions?: FlowMetaParam[]
  waits?: FlowMetaParam[]
  loops?: FlowMetaParam[]
  sortCollectionProcessor?: FlowEdgeMeta[]
  recordCreates?: FlowMetaParam[]
  recordUpdates?: FlowMetaParam[]
  recordDeletes?: FlowMetaParam[]
  recordLookups?: FlowMetaParam[]
}

export enum FlowMetaType {
  START = 'start',
  ASSIGNMENT = 'assignments',
  DECISION = 'decisions',
  WAIT= 'waits',
  LOOP = 'loops',
  SORT_COLLECTION_PROCESSOR = 'sortCollectionProcessor',
  RECORD_CREATE = 'recordCreates',
  RECORD_UPDATE = 'recordUpdates',
  RECORD_DELETE = 'recordDeletes',
  RECORD_LOOKUP = 'recordLookups'
}

export interface FlowMetaParam {
  id: string
  name: string
  description?: string
  connector?: TargetReference
  defaultConnector?: TargetReference
  faultConnector?: TargetReference
  nextValueConnector?: TargetReference
  defaultConnectorName?: string
  assignmentItems?: IAssignmentData[]
  rules?: FlowMetaParam[]
  collectionReference?: string
  iterationOrder?: string
  limit?: null | number
  sortOptions?: SortOption[]
  registerId?: string
  inputAssignments?: IInputAssignment[]
  storeOutputAutomatically?: boolean
  assignRecordIdToReference?: string
  criteria?: Criteria | null
  outputAssignments?: IOutputAssignment[]
  outputReference?: null | string
  queriedFields?: string[]
  sortOrder?: SortOrder
  sortField?: string
  getFirstRecordOnly?: boolean
  waitEvents?: IwaitEvent[]
}

export interface IStartFlowMeta {
  id: string
  name: string
  description?: string
  connector?: TargetReference
  criteria?: Criteria | null
  objectId?: string
  recordTriggerType?: RecordTriggerTypeEnum
  schedule?: ISchedule
  triggerType?: TriggerTypeEnum
  type: FlowType
}

export interface IwaitEvent {
  connector: TargetReference
  outputParameters?: IOutParameter[]
  id: string
  name: string
  criteria?: Criteria | null
  eventType: string
  recoveryTimeInfo: IRecoveryTimeInfo
}

export interface IRecoveryTimeInfo {
  dateValue: string
  dateValueType: string
  field: string
  offsetNum?: number
  offsetUnit?: string
  recordIdType: string
  recordIdValue: string
  registerId: string
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

export interface TargetReference {
  targetReference: string | null
}

export interface Criteria {
  conditions: ICriteriaCondition[]
  logic: string
}

export type FlowNodeComm = {
  id: string
  label: string
  type: FlowMetaType
}

export enum OpartType {
  EDIT = 'edit',
  REMOVE = 'remove'
}

export interface IInputAssignment {
  field: string
  type: string
  value: any
}

export interface IOutParameter {
  id: string
  type?: string
  value?: any
}

export interface ICriteriaCondition {
  fieldPattern: string
  operation: string
  type: string
  value: any
}

export interface IAssignmentData {
  assignToReference: string
  operation: string
  type: string
  value: any
}

export interface IOutputAssignment {
  assignToReference: string
  field: string
}

export interface IFieldMetaFlow extends IFieldMeta {
  webType?: string
  flowMetaType?: FlowMetaType
}

export type FlowType =
  | 'AUTO_START_UP'
  | 'PLAN_TRIGGER'
  | 'PLATFORM_EVENT'
  | 'RECORD_TRIGGER'
  | 'SCREEN'

export interface ISchedule {
  frequency: string
  startDate: string
  startTime: string
}

export enum TriggerTypeEnum {
  RECORD_AFTER_SAVE = 'recordAfterSave',
  RECORD_BEFORE_SAVE = 'recordBeforeSave',
}

export enum RecordTriggerTypeEnum {
  CREATE = 'create',
  UPDATE = 'update',
  CREATE_OR_UPDATE = 'createOrUpdate',
  DELETE = 'delete'
}

export enum FlowTypeCodeEnum {
  SCREEN = 'SCREEN',
  PLAN_TRIGGER = 'PLAN_TRIGGER',
  AUTO_START_UP = 'AUTO_START_UP',
  RECORD_TRIGGER = 'RECORD_TRIGGER',
}

export enum opTypeEnum {
  INPUT = 'INPUT',
}

