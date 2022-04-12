/* eslint-disable react-hooks/rules-of-hooks */
import {
  define,
  observable,
  batch,
} from '@formily/reactive'
import { Flow, FlowNodeType } from '@toy-box/flow-graph';
import { IFieldMeta, IFieldGroupMeta, MetaValueType, IFieldOption } from '@toy-box/meta-schema';
import { isArr } from '@formily/shared';
import { clone, isNum, isObj } from '@toy-box/toybox-shared';
import update from 'immutability-helper'
import { FlowGraphMeta, FlowMetaType, FlowMetaParam, IFlowResourceType, IFieldMetaFlow, FlowType } from '../types'
import { uid } from '../../utils';
import { FlowStart, FlowAssignment, FlowDecision, FlowLoop,
  FlowSortCollectionProcessor, FlowSuspend, RecordCreate,
  RecordUpdate, RecordDelete, RecordLookup } from './index'
import { useLocale } from '../../hooks'
// import { runEffects } from '../shared/effectbox'
import { History, OpearteTypeEnum, ConnectorKeyEnum } from './History'
import { QuoteMetaOfUpdate } from './QuoteMetaOfUpdate'

const STAND_SIZE = 56;

export interface NodeProps {
  id: string;
  width: number;
  height: number;
  type: FlowNodeType;
  label?: string;
  targets?: string[];
  decisionEndTarget?: string;
  loopBackTarget?: string;
  loopEndTarget?: string;
  component?: string;
  onClick?: () => void;
}

const showMetaTypes = [
  FlowMetaType.START,
  FlowMetaType.ASSIGNMENT,
  FlowMetaType.DECISION,
  FlowMetaType.WAIT,
  FlowMetaType.LOOP,
  FlowMetaType.SORT_COLLECTION_PROCESSOR,
  FlowMetaType.RECORD_CREATE,
  FlowMetaType.RECORD_DELETE,
  FlowMetaType.RECORD_LOOKUP,
  FlowMetaType.RECORD_UPDATE,
];

export enum MetaFieldType {
  EDIT = 'EDIT',
  ADD = 'ADD',
  REMOVE = 'REMOVE',
  INIT = 'INIT',
} 

export enum FlowModeEnum {
  EDIT = 'edit',
  READ = 'read',
}

export type FlowModeType = FlowModeEnum.EDIT | FlowModeEnum.READ

export interface FlowMetaParamOfType extends FlowMetaParam {
  flowType: FlowMetaType
}

export class AutoFlow {
  id: string
  disposers: (() => void)[] = []
  initialMeta: FlowGraphMeta
  flowNodes: NodeProps[] = []
  metaFlowDatas: FlowMetaParamOfType[] = []
  mataFlowJson: FlowGraphMeta
  flowGraph: Flow
  flowEndId: string
  flowStart: FlowStart = {} as FlowStart
  flowAssignments: FlowAssignment[] = []
  flowDecisions: FlowDecision[] = []
  flowLoops: FlowLoop[] = []
  flowSortCollections: FlowSortCollectionProcessor[] = []
  flowSuspends: FlowSuspend[] = []
  recordCreates: RecordCreate[] = []
  recordUpdates: RecordUpdate[] = []
  recordDeletes: RecordDelete[] = []
  recordLookups: RecordLookup[] = []
  flowConstants: IFieldMeta[] = []
  flowFormulas: IFieldMeta[] = []
  flowTemplates: IFieldMeta[] = []
  flowVariables: IFieldMeta[] = []
  history: History
  registers: any[] = []
  mode: FlowModeType = FlowModeEnum.EDIT
  flowType: FlowType
  isEdit: boolean | undefined

  constructor(autoFlowMeta: FlowGraphMeta, flowType: FlowType, mode?: FlowModeType) {
    this.id = autoFlowMeta.id
    this.initialMeta = autoFlowMeta
    this.flowType = flowType
    this.mode = mode || FlowModeEnum.EDIT
    this.isEdit = this.mode === FlowModeEnum.EDIT
    this.mataFlowJson = {
      id: autoFlowMeta.id,
      name: autoFlowMeta.name,
      flow: {}
    }
    this.history = new History(undefined, {
      onRedo: (item) => {
        this.flowGraph = new Flow()
        this.mataFlowJson.flow = item.flow
        this.flowNodes = item.flowNodes
      },
      onUndo: (item) => {
        this.flowGraph = new Flow()
        this.mataFlowJson.flow = item.flow
        this.flowNodes = item.flowNodes
      },
    })
    this.flowGraph = new Flow()
    this.flowEndId = uid()
    this.makeObservable()
    this.onInit()
    // this.history.push(this.mataFlowJson.flow)
  }

  protected makeObservable() {
    define(this, {
      setId: batch,
      flowGraph: observable.deep,
      flowNodes: observable.deep,
      mataFlowJson: observable.deep,
      flowStart: observable.deep,
      flowAssignments: observable.shallow,
      flowDecisions: observable.shallow,
      flowSuspends: observable.shallow,
      flowLoops: observable.shallow,
      flowSortCollections: observable.shallow,
      recordCreates: observable.shallow,
      recordDeletes: observable.shallow,
      recordLookups: observable.shallow,
      recordUpdates: observable.shallow,
      flowConstants: observable.shallow,
      flowVariables: observable.shallow,
      flowFormulas: observable.shallow,
      flowTemplates: observable.shallow,
      registers: observable.shallow,
      fieldMetas: observable.computed,
      formulaMap: observable.computed,
      // onInit: batch,
    })
  }

  setId = (id: string) => {
    this.id = id
  }

  initRegisters(data: any[]) {
    this.registers = data
  }

  editFlowData = (nodeId: string, metaType: FlowMetaType, flowData: FlowMetaParam) => {
    if (flowData.id !== nodeId) {
      this.metaFlowDatas = this.metaFlowDatas.map((meta) => {
        if (meta.id === nodeId) return {
          ...flowData,
          flowType: metaType,
        }
        return meta
      })
      this.metaFlowDatas.forEach((meta) => {
        if (meta.connector?.targetReference === nodeId) {
          meta.connector.targetReference = flowData.id
          this.initMetaFields(meta.flowType, meta, MetaFieldType.EDIT, nodeId)
        } else if (meta.defaultConnector?.targetReference === nodeId) {
          meta.defaultConnector.targetReference = flowData.id
          this.initMetaFields(meta.flowType, meta, MetaFieldType.EDIT, nodeId)
        } else if (meta.faultConnector?.targetReference === nodeId) {
          meta.faultConnector.targetReference = flowData.id
          this.initMetaFields(meta.flowType, meta, MetaFieldType.EDIT, nodeId)
        } else if (meta.nextValueConnector?.targetReference === nodeId) {
          meta.nextValueConnector.targetReference = flowData.id
          this.initMetaFields(meta.flowType, meta, MetaFieldType.EDIT, nodeId)
        }
      })
    } else {
      this.metaFlowDatas = this.metaFlowDatas.map((meta) => {
        if (meta.id === flowData.id) return {
          ...flowData,
          flowType: metaType,
        }
        return meta
      })
    }
    this.initMetaFields(metaType, flowData, MetaFieldType.EDIT, nodeId)
    if (metaType === FlowMetaType.RECORD_LOOKUP && nodeId !== flowData.id) {
      this.fieldMetas.some((meta) => {
        const data = meta.children.find((child) => child.key === nodeId || child.key === flowData.id)
        if (data) QuoteMetaOfUpdate(this, data, nodeId)
        return data
      })
    }
    this.flowNodes = []
    this.setFlowData(this.metaFlowDatas)
    this.flowNodes.push({
      id: this.flowEndId,
      type: 'end',
      width: STAND_SIZE,
      height: STAND_SIZE,
      component: 'EndNode',
    })
    this.flowGraph = new Flow()
    const nodes = clone(this.flowNodes)
    const obj = {
      opearteId: nodeId,
      opearteType: OpearteTypeEnum.UPDATE,
      data: flowData,
      type: metaType,
      flow: clone(this.mataFlowJson.flow),
      flowNodes: nodes,
    }
    this.history.push(obj)
  }

  removeFlowData = (nodeId: string, metaType: FlowMetaType, flowData: FlowMetaParam) => {
    const fork = (metaType === FlowMetaType.DECISION || metaType === FlowMetaType.WAIT) ? flowData : undefined
    this.removeFlowDataFunc(nodeId, metaType, flowData, false, fork)
    let targetId: string | null = null
    switch (metaType) {
      case FlowMetaType.LOOP:
        targetId = flowData.defaultConnector?.targetReference || null
        break;
      case FlowMetaType.ASSIGNMENT:
      case FlowMetaType.SORT_COLLECTION_PROCESSOR:
      case FlowMetaType.RECORD_CREATE:
      case FlowMetaType.RECORD_DELETE:
      case FlowMetaType.RECORD_LOOKUP:
      case FlowMetaType.RECORD_UPDATE:
      case FlowMetaType.DECISION:
      case FlowMetaType.WAIT:
        targetId = flowData.connector?.targetReference || null
        break;
      default:
        break;
    }
    this.metaFlowDatas.forEach((meta) => {
      if (meta.connector?.targetReference === nodeId) {
        meta.connector.targetReference = targetId
        this.initMetaFields(meta.flowType, meta, MetaFieldType.EDIT, nodeId)
      } else if (meta.defaultConnector?.targetReference === nodeId) {
        meta.defaultConnector.targetReference = targetId
        this.initMetaFields(meta.flowType, meta, MetaFieldType.EDIT, nodeId)
      } else if (meta.faultConnector?.targetReference === nodeId) {
        meta.faultConnector.targetReference = targetId
        this.initMetaFields(meta.flowType, meta, MetaFieldType.EDIT, nodeId)
      } else if (meta.nextValueConnector?.targetReference === nodeId) {
        meta.nextValueConnector.targetReference = meta.id !== targetId ? targetId : null
        this.initMetaFields(meta.flowType, meta, MetaFieldType.EDIT, nodeId)
      } else if (meta.flowType === FlowMetaType.DECISION || meta.flowType === FlowMetaType.WAIT) {
        meta.rules?.forEach((rule) => {
          if (rule.connector?.targetReference === nodeId) {
            rule.connector.targetReference = targetId
            this.initMetaFields(meta.flowType, meta, MetaFieldType.EDIT, nodeId)
          }
        })
        meta.waitEvents?.forEach((rule) => {
          if (rule.connector?.targetReference === nodeId) {
            rule.connector.targetReference = targetId
            this.initMetaFields(meta.flowType, meta, MetaFieldType.EDIT, nodeId)
          }
        })
      }
    })
    this.flowGraph = new Flow()
    this.flowNodes = []
    this.setFlowData(this.metaFlowDatas)
    this.flowNodes.push({
      id: this.flowEndId,
      type: 'end',
      width: STAND_SIZE,
      height: STAND_SIZE,
      component: 'EndNode',
    })
    const nodes = clone(this.flowNodes)
    const obj = {
      opearteId: nodeId,
      opearteType: OpearteTypeEnum.REMOVE,
      data: flowData,
      type: metaType,
      flow: clone(this.mataFlowJson.flow),
      flowNodes: nodes,
    }
    this.history.push(obj)
  }

  removeFlowDataFunc = (nodeId: string, metaType: FlowMetaType, flowData: FlowMetaParam, flag?: boolean, fork?: FlowMetaParam) => {
    switch (metaType) {
      case FlowMetaType.DECISION:
      case FlowMetaType.WAIT:
        this.initMetaFields(metaType, flowData, MetaFieldType.REMOVE, nodeId)
        const targetReferenceId = flowData.defaultConnector?.targetReference
        this.metaFlowDatas = this.metaFlowDatas.filter((meta) => meta.id !== nodeId)
        const currnetMeta = this.metaFlowDatas.find((meta) => meta.id === targetReferenceId)
        const rules = flowData?.rules || flowData.waitEvents
        rules?.forEach((rule) => {
          const currnetRuleMeta = this.metaFlowDatas.find((meta) => meta.id === rule.connector?.targetReference)
          if (currnetRuleMeta && fork?.connector?.targetReference !== rule.connector?.targetReference) this.removeFlowDataFunc(currnetRuleMeta?.id, currnetRuleMeta.flowType, currnetRuleMeta, true, fork)
        })
        if (currnetMeta && fork?.connector?.targetReference !== targetReferenceId) this.removeFlowDataFunc(currnetMeta?.id, currnetMeta.flowType, currnetMeta, true, fork)
        break;
      case FlowMetaType.LOOP:
        this.initMetaFields(metaType, flowData, MetaFieldType.REMOVE, nodeId)
        const nextTargetId = flowData.nextValueConnector?.targetReference
        this.metaFlowDatas = this.metaFlowDatas.filter((meta) => meta.id !== nodeId)
        const nextMeta = this.metaFlowDatas.find((meta) => meta.id === nextTargetId)
        if (flowData.defaultConnector?.targetReference !== fork?.connector?.targetReference && flag) {
          const currentDefault = this.metaFlowDatas.find((meta) => meta.id === flowData.defaultConnector?.targetReference)
          if (currentDefault) this.removeFlowDataFunc(currentDefault?.id, currentDefault.flowType, currentDefault, true, fork)
        }
        if (nextMeta) {
          this.removeFlowDataFunc(nextMeta?.id, nextMeta.flowType, nextMeta, true)
          const defaultTargetId = nextMeta.defaultConnector?.targetReference
          const defaultMeta = this.metaFlowDatas.find((meta) => meta.id === defaultTargetId)
          if (defaultMeta) this.removeFlowDataFunc(defaultMeta?.id, defaultMeta.flowType, defaultMeta, true, fork)
        }
        break;
      case FlowMetaType.ASSIGNMENT:
      case FlowMetaType.SORT_COLLECTION_PROCESSOR:
      case FlowMetaType.RECORD_CREATE:
      case FlowMetaType.RECORD_DELETE:
      case FlowMetaType.RECORD_LOOKUP:
      case FlowMetaType.RECORD_UPDATE:
        this.initMetaFields(metaType, flowData, MetaFieldType.REMOVE, nodeId)
        this.metaFlowDatas = this.metaFlowDatas.filter((meta) => meta.id !== nodeId)
        if (flowData.connector?.targetReference !== fork?.connector?.targetReference && flag) {
          const baseMeta = this.metaFlowDatas.find((meta) => meta.id === flowData.connector?.targetReference)
          if (baseMeta) this.removeFlowDataFunc(baseMeta?.id, baseMeta.flowType, baseMeta, true, fork)
        }
        break;
      default:
        break;
    }
  }

  updateInitialMeta = (nodeId: string, metaType: FlowMetaType, flowData: FlowMetaParam) => {
    // console.log('111112323232', nodeId, metaType)
    const data = flowData
    const flowNode: NodeProps | undefined = this.flowNodes.find((node) => node.id === nodeId)
    this.updataFlowMetaData(flowNode, metaType, flowData)
    // this.flowNodes = []
    // this.flowNodes.push({
    //   id: this.flowEndId,
    //   type: 'end',
    //   width: STAND_SIZE,
    //   height: STAND_SIZE,
    //   component: 'EndNode',
    // })
    let flowMeta: any = undefined
    const flowMetas = this.metaFlowDatas.filter(mta => {
      if (mta.id === data.id) {
        flowMeta = mta
        return false
      }
      return true
    })
    let fork = undefined
    flowMetas.some(ft => {
      if (flowMeta.flowType === FlowMetaType.LOOP) {
        if (ft.flowType === FlowMetaType.LOOP) {
          if (ft.defaultConnector?.targetReference === flowMeta?.defaultConnector?.targetReference) {
            fork = ft
            return ft
          }
        } else if (ft.connector?.targetReference === flowMeta?.defaultConnector?.targetReference) {
          fork = ft
          return ft
        }
      } else {
        if (ft.flowType === FlowMetaType.LOOP) {
          if (ft.defaultConnector?.targetReference === flowMeta?.connector?.targetReference) {
            fork = ft
            return ft
          }
        } else if (ft.connector?.targetReference === flowMeta?.connector?.targetReference) {
          fork = ft
          return ft
        }
      }
    })
    if (flowMeta) this.initFlowNodes(metaType, flowMeta, flowNode, fork)
    this.flowGraph = new Flow()
    const loopBase = this.flowNodes.find((node) => node.loopEndTarget === flowNode?.id)
    const decisionBase = this.flowNodes.find((node) => node.loopEndTarget === flowNode?.id)
    const nodes = clone(this.flowNodes)
    const obj = {
      opearteType: OpearteTypeEnum.ADD,
      data: flowData,
      flow: clone(this.mataFlowJson.flow),
      flowNodes: nodes,
      type: metaType,
    } as any
    if (loopBase) { 
      obj.opearteId = loopBase.id
      obj.useConnectorKey = 'defaultConnector'
    } else if (decisionBase) {
      obj.opearteId = decisionBase.id
      obj.useConnectorKey = 'connector'
    } else {
      const base = this.flowNodes.find((node) => {
        return flowNode?.id && node.targets?.includes(flowNode?.id)
      })
      if (base?.component === 'LabelNode') {
        const flowNode = this.flowNodes.find((node) => {
          return node.targets?.includes(base?.id)
        })
        if (flowNode) {
          const len = flowNode.targets?.length
          if (len && len > 1) {
            obj.opearteId = flowNode?.id
            obj.useConnectorKey = 'connector'
            obj.opearteRule = {
              id: base?.id,
              connector: flowData.id
            }
          } else {
            obj.opearteId = flowNode?.id
            obj.useConnectorKey = 'nextValueConnector'
          }
        }
      } else {
        obj.opearteId = base?.id
        obj.useConnectorKey = 'connector'
      }
    }
    this.history.push(obj)
    console.log(this.mataFlowJson.flow, 'this.mataFlowJson.flow')
  }

  updataFlowMetaData = (flowNode: NodeProps | undefined, metaType: FlowMetaType, flowData: FlowMetaParam, currentUpdataData?: FlowMetaParam) => {
    const flow = this.mataFlowJson.flow as any
    const data = { ...flowData }
    if (metaType === FlowMetaType.LOOP) {
      data.nextValueConnector = {
        targetReference: null
      }
    } else {
      data.connector = {
        targetReference: null
      }
    }
    this.metaFlowDatas.some((meta) => {
      const forkBeginOfEndNode = this.flowNodes.find((node) => node.decisionEndTarget === flowNode?.id)
      const base = this.flowNodes.find((node) => {
        return node?.targets?.length === 1 && flowNode?.id && node.targets.includes(flowNode?.id)
      })
      const forkBeginOfForwardNode = this.flowNodes.find((node) => {
        return base?.component === 'LabelNode' &&
          (node?.targets || []).length > 1 && base?.id && (node?.targets || []).includes(base?.id)
      })
      let baseNode = base
      if (base?.component === 'LabelNode' && !forkBeginOfForwardNode) {
        baseNode = this.flowNodes.find((node) => {
          return node?.targets?.length === 1 && base?.id && node.targets.includes(base?.id)
        })
      }
      const cycleBackLabelNode = this.flowNodes.find((node) => node.loopBackTarget === flowNode?.id)
      let cycleBeginOfBackNode = cycleBackLabelNode
      if (cycleBackLabelNode?.component === 'LabelNode') {
        cycleBeginOfBackNode = this.flowNodes.find((node) => {
          return node?.targets?.length === 1 &&
          cycleBackLabelNode?.id && node.targets.includes(cycleBackLabelNode?.id)
        })
      }
      const cycleBeginOfEndNode = this.flowNodes.find((node) => node.loopEndTarget === flowNode?.id)
      if (isObj(flow[meta.flowType]) && baseNode?.type === 'begin') {
        this.updataCurrentFlowData(meta, data, metaType)
        const currentFlow = {
          ...flow[meta.flowType]
        }
        if (meta.flowType === FlowMetaType.DECISION || meta.flowType === FlowMetaType.WAIT) {
          this.nextTargetFork(currentFlow, data.id, meta.flowType)
        } else {
          currentFlow.connector.targetReference = data.id
          this.initMetaFields(meta.flowType, currentFlow, MetaFieldType.EDIT, currentFlow.id)
        }
        // currentFlow.connector.targetReference = data.id
        // this.initMetaFields(meta.flowType, currentFlow, MetaFieldType.EDIT, currentFlow.id)
        return meta
      } else if (isArr(flow[meta.flowType])) {
        const flowIdx = flow[meta.flowType]?.findIndex((flowMeta: FlowMetaParam) => flowMeta.id === meta.id)
        if (forkBeginOfEndNode?.id === meta.id) {
          this.updataCurrentFlowData(meta, data, metaType)
          if (flowIdx > -1) {
            const currentFlow = {
              ...flow[meta.flowType][flowIdx]
            }
            this.nextTargetFork(currentFlow, data.id, meta.flowType, currentFlow?.connector?.targetReference)
            // currentFlow.connector.targetReference = data.id
            // this.initMetaFields(meta.flowType, currentFlow, MetaFieldType.EDIT, currentFlow.id)
          }
          return meta
        } else if ((baseNode?.id === meta.id && !cycleBeginOfBackNode && baseNode?.component !== 'LabelNode')) {
          if (meta.flowType === FlowMetaType.LOOP) {
            if (metaType === FlowMetaType.LOOP && data?.defaultConnector) {
              data.defaultConnector.targetReference = meta?.nextValueConnector?.targetReference || meta?.id || null
            } else if (data.connector) {
              const refValue = meta?.nextValueConnector?.targetReference || meta?.id || null
              if (metaType === FlowMetaType.DECISION || metaType === FlowMetaType.WAIT) {
                if (data.defaultConnector) data.defaultConnector.targetReference = refValue
                const waitEvents = data?.rules || data?.waitEvents || []
                waitEvents.forEach((rule: FlowMetaParam) => {
                  if (rule.connector) rule.connector.targetReference = refValue
                })
              }
              data.connector.targetReference = refValue
            }
            if (flowIdx > -1) {
              const currentFlow = {
                ...flow[meta.flowType][flowIdx]
              }
              currentFlow.nextValueConnector.targetReference = data.id
              this.initMetaFields(meta.flowType, currentFlow, MetaFieldType.EDIT, currentFlow.id)
            }
            // flow[metaType].push(data)
            this.initMetaFields(metaType, data, MetaFieldType.ADD)
          } else {
            this.updataCurrentFlowData(meta, data, metaType)
            if (flowIdx > -1) {
              const currentFlow = {
                ...flow[meta.flowType][flowIdx]
              }
              if (meta.flowType === FlowMetaType.DECISION || meta.flowType === FlowMetaType.WAIT) {
                this.nextTargetFork(currentFlow, data.id, meta.flowType, currentFlow?.connector?.targetReference)
              } else {
                currentFlow.connector.targetReference = data.id
                this.initMetaFields(meta.flowType, currentFlow, MetaFieldType.EDIT, currentFlow.id)
              }
              // currentFlow.connector.targetReference = data.id
              // this.initMetaFields(meta.flowType, currentFlow, MetaFieldType.EDIT, currentFlow.id)
            }
          }
          return meta
        } else if (forkBeginOfForwardNode?.id === meta.id) {
          const rules = meta?.rules || meta?.waitEvents
          const idx = rules?.findIndex((rule) => rule.id === baseNode?.id)
          if (isNum(idx) && idx > -1 && flowIdx > -1) {
            if (metaType === FlowMetaType.LOOP && data?.defaultConnector) {
              data.defaultConnector.targetReference = rules?.[idx]?.connector?.targetReference || null
            } else if (data.connector) {
              if (metaType === FlowMetaType.DECISION || metaType === FlowMetaType.WAIT) {
                if (data.defaultConnector) data.defaultConnector.targetReference = rules?.[idx]?.connector?.targetReference || null
                const waitEvents = data?.rules || data?.waitEvents || []
                waitEvents.forEach((rule: FlowMetaParam) => {
                  if (rule.connector) rule.connector.targetReference = rules?.[idx]?.connector?.targetReference || null
                })
              }
              data.connector.targetReference = rules?.[idx]?.connector?.targetReference || null
            }
            this.initMetaFields(metaType, data, MetaFieldType.ADD)
            const currentFlow = {
              ...flow[meta.flowType][flowIdx]
            }
            const currentFlowRules = currentFlow.rules || currentFlow.waitEvents
            currentFlowRules[idx].connector.targetReference = data.id
            this.initMetaFields(meta.flowType, currentFlow, MetaFieldType.EDIT, currentFlow.id)
          } else if (flowIdx > -1) {
            if (metaType === FlowMetaType.LOOP && data?.defaultConnector) {
              data.defaultConnector.targetReference = flow[meta.flowType][flowIdx]?.defaultConnector?.targetReference || null
            } else if (data.connector) {
              if (metaType === FlowMetaType.DECISION || metaType === FlowMetaType.WAIT) {
                if (data.defaultConnector) data.defaultConnector.targetReference = flow[meta.flowType][flowIdx]?.defaultConnector?.targetReference || null
                const waitEvents = data?.rules || data?.waitEvents || []
                waitEvents.forEach((rule: FlowMetaParam) => {
                  if (rule.connector) rule.connector.targetReference = flow[meta.flowType][flowIdx]?.defaultConnector?.targetReference || null
                })
              }
              data.connector.targetReference = flow[meta.flowType][flowIdx]?.defaultConnector?.targetReference || null
            }
            this.initMetaFields(metaType, data, MetaFieldType.ADD)
            const currentFlow = {
              ...flow[meta.flowType][flowIdx]
            }
            currentFlow.defaultConnector.targetReference = data.id
            this.initMetaFields(meta.flowType, currentFlow, MetaFieldType.EDIT, currentFlow.id)
          }
          return meta
        } else if (cycleBeginOfBackNode?.id === meta.id) {
          if (meta?.nextValueConnector?.targetReference === null && flowIdx > -1) {
            this.updataCurrentFlowData(meta, data, metaType, true)
            const currentFlow = {
              ...flow[meta.flowType][flowIdx]
            }
            currentFlow.nextValueConnector.targetReference = data.id
            this.initMetaFields(meta.flowType, currentFlow, MetaFieldType.EDIT, currentFlow.id)
          } else {
            this.updataCurrentFlowData(meta, data, metaType, true)
            const labelNode = this.flowNodes.find((nd) => nd?.targets?.[0] === flowNode?.id)
            let node = labelNode
            if (labelNode?.component === 'LabelNode') {
              node = this.flowNodes.find((node) => node?.loopEndTarget === flowNode?.id)
              if (!node) {
                node = this.flowNodes.find((node) => node?.loopBackTarget === flowNode?.id)
              }
            } else {
              const forkNode = this.flowNodes.find((node) => node?.decisionEndTarget === flowNode?.id)
              if (forkNode) node = forkNode
            }
            const mTData = this.metaFlowDatas.find((mt) => mt.id === node?.id)
            const mtIdx = mTData?.flowType && flow[mTData?.flowType]?.findIndex((flowMeta: FlowMetaParam) => flowMeta.id === mTData?.id)
            if (mTData && mtIdx > -1 && mTData.flowType === FlowMetaType.LOOP) {
              const currentFlow = {
                ...flow[mTData.flowType][mtIdx]
              }
              currentFlow.defaultConnector.targetReference = data.id
              this.initMetaFields(mTData.flowType, currentFlow, MetaFieldType.EDIT, currentFlow.id)
              // flow[mTData.flowType][mtIdx].defaultConnector.targetReference = data.id
            } else if (mTData && mtIdx > -1) {
              const currentFlow = {
                ...flow[mTData.flowType][mtIdx]
              }
              if (mTData.flowType === FlowMetaType.DECISION || mTData.flowType === FlowMetaType.WAIT) {
                this.nextTargetFork(currentFlow, data.id, meta.flowType, currentFlow?.connector?.targetReference)
              } else {
                currentFlow.connector.targetReference = data.id
                this.initMetaFields(mTData.flowType, currentFlow, MetaFieldType.EDIT, currentFlow.id)
              }
              // flow[mTData.flowType][mtIdx].connector.targetReference = data.id
            }
          }
          return meta
        } else if (cycleBeginOfEndNode?.id === meta.id) {
          // this.updataCurrentFlowData(meta, data, metaType)
          if (metaType === FlowMetaType.LOOP && data?.defaultConnector) {
            data.defaultConnector.targetReference = meta?.defaultConnector?.targetReference || null
          } else if (data.connector) {
            if (metaType === FlowMetaType.DECISION || metaType === FlowMetaType.WAIT) {
              if (data.defaultConnector) data.defaultConnector.targetReference = meta?.connector?.targetReference || null
              const rules = data?.rules || data?.waitEvents || []
              rules.forEach((rule: FlowMetaParam) => {
                if (rule.connector) rule.connector.targetReference = meta?.connector?.targetReference || null
              })
            }
            data.connector.targetReference = meta?.defaultConnector?.targetReference || null
          }
          this.initMetaFields(metaType, data, MetaFieldType.ADD)
          const currentFlow = {
            ...flow[meta.flowType][flowIdx]
          }
          currentFlow.defaultConnector.targetReference = data.id
          this.initMetaFields(meta.flowType, currentFlow, MetaFieldType.EDIT, currentFlow.id)
          return meta
        }
      }
      return false
    })
  }

  nextTargetFork = (flowData: any, nodeId: string, flowType: FlowMetaType, connectorId?: string) => {
    if (flowData?.defaultConnector?.targetReference === null || flowData?.defaultConnector?.targetReference === connectorId) {
      flowData.defaultConnector.targetReference = nodeId
    } else {
      this.nextFork(flowData.defaultConnector.targetReference, flowData.connector.targetReference, nodeId, flowType)
    }
    const rules = flowData?.rules || flowData?.waitEvents
    rules.forEach((rule: FlowMetaParam) => {
      const targetReference = rule.connector?.targetReference
      if (rule.connector?.targetReference === null || rule.connector && targetReference === connectorId) {
        rule.connector.targetReference = nodeId
      } else if (targetReference && flowData?.connector?.targetReference) {
        this.nextFork(targetReference, flowData.connector.targetReference, nodeId, flowType)
      }
    })
    flowData.connector.targetReference = nodeId
    this.initMetaFields(flowType, flowData, MetaFieldType.EDIT, flowData.id)
  }

  nextFork = (targetReference: string, connectorId: string, nodeId: string, flowType: FlowMetaType) => {
    const node = this.metaFlowDatas.find(meta => meta.id === targetReference)
    if (node?.flowType === FlowMetaType.LOOP && node.defaultConnector?.targetReference === connectorId) {
      node.defaultConnector.targetReference = nodeId
      this.initMetaFields(node.flowType, node, MetaFieldType.EDIT, node.id)
    } else if(node?.connector?.targetReference === connectorId) {
      if (node.flowType === FlowMetaType.DECISION || node.flowType === FlowMetaType.WAIT) {
        this.nextTargetFork(node, nodeId, flowType, connectorId)
      } else {
        node.connector.targetReference = nodeId
        this.initMetaFields(node.flowType, node, MetaFieldType.EDIT, node.id)
      }
    } else {
      if (node?.flowType === FlowMetaType.LOOP && node.defaultConnector?.targetReference) {
        this.nextFork(node.defaultConnector?.targetReference, connectorId, nodeId, flowType)
      } else if (node?.connector?.targetReference) {
        if (node?.flowType === FlowMetaType.DECISION || node.flowType === FlowMetaType.WAIT) {
          this.nextTargetFork(node, nodeId, flowType, connectorId)
        } else {
          this.nextFork(node.connector?.targetReference, connectorId, nodeId, flowType)
        }
      } else if (node) {
        if (node?.flowType === FlowMetaType.DECISION || node.flowType === FlowMetaType.WAIT) {
          this.nextTargetFork(node, nodeId, flowType, connectorId)
        } else if (node.connector) {
          node.connector.targetReference = nodeId
          this.initMetaFields(node.flowType, node, MetaFieldType.EDIT, node.id)
        }
      }
    }
  }

  updataCurrentFlowData = (meta: FlowMetaParamOfType, data: FlowMetaParam, metaType: FlowMetaType, loopBack?: boolean) => {
    // const flow = this.initialMeta.flow as any
    if (meta.flowType !== FlowMetaType.LOOP) {
      if (metaType === FlowMetaType.LOOP && data?.defaultConnector) {
        data.defaultConnector.targetReference = meta?.connector?.targetReference || null
      } else if (data.connector) {
        if (metaType === FlowMetaType.DECISION || metaType === FlowMetaType.WAIT) {
          if (data.defaultConnector) data.defaultConnector.targetReference = meta?.connector?.targetReference || null
          const rules = data?.rules || data?.waitEvents || []
          rules.forEach((rule: FlowMetaParam) => {
            if (rule.connector) rule.connector.targetReference = meta?.connector?.targetReference || null
          })
        }
        data.connector.targetReference = meta?.connector?.targetReference || null
      }
    } else {
      if (metaType === FlowMetaType.LOOP && data?.defaultConnector) {
        data.defaultConnector.targetReference = loopBack ? meta.id : meta?.connector?.targetReference || null
      } else if (data.connector) {
        if (metaType === FlowMetaType.DECISION || metaType === FlowMetaType.WAIT) {
          if (data.defaultConnector) data.defaultConnector.targetReference = loopBack ? meta.id : meta?.connector?.targetReference || null
          const rules = data?.rules || data?.waitEvents || []
          rules.forEach((rule: FlowMetaParam) => {
            if (rule.connector) rule.connector.targetReference = loopBack ? meta.id : meta?.connector?.targetReference || null
          })
        }
        data.connector.targetReference = loopBack ? meta.id : meta?.connector?.targetReference || null
      }
    }
    console.log(metaType, meta, 'meta')
    this.initMetaFields(metaType, data, MetaFieldType.ADD)
  }

  onInit = () => {
    this.metaFlowDatas = []
    const flowData = this.initialMeta.flow as any
    for (const key in flowData) {
      if (flowData.hasOwnProperty(key)) {
        const metaType = showMetaTypes.find(type => type === key)
        this.initMetaFields(key, flowData)
        if (metaType) {
          if (metaType === FlowMetaType.START) {
            this.flowEndId = flowData[key]?.defaultConnector?.targetReference || this.flowEndId
          }
          if (isArr(flowData[key])) {
            flowData[key].forEach((data: FlowMetaParam) => {
              this.metaFlowDatas.push({
                ...data,
                flowType: metaType
              })
            })
          } else if (flowData[key]) {
            this.metaFlowDatas.push({
              ...flowData[key],
              flowType: metaType
            })
          }
        }
      }
    }
    this.setFlowData(this.metaFlowDatas)
    this.flowNodes.push({
      id: this.flowEndId,
      type: 'end',
      width: STAND_SIZE,
      height: STAND_SIZE,
      component: 'EndNode',
    })
    const nodes = clone(this.flowNodes)
    this.history.push({
      flow: clone(this.initialMeta.flow),
      flowNodes: nodes,
    })
    console.log(this.flowNodes, this.metaFlowDatas, 'end')
  }

  initMetaFields = (metaType: string, flowData: FlowMetaParam | any, metaFieldType?: MetaFieldType, nodeId?: string) => {
    const data = { ...flowData }
    if (metaFieldType === MetaFieldType.EDIT) {
      this.metaFlowDatas = this.metaFlowDatas.map((meta) => {
        if (meta.id === nodeId) return {
          ...data,
          flowType: metaType,
        }
        return meta
      })
    } else if (metaFieldType === MetaFieldType.ADD) {
      this.metaFlowDatas.push({
        ...data,
        flowType: metaType,
      })
    }
    switch (metaType) {
      case FlowMetaType.START:
        if (metaFieldType === MetaFieldType.EDIT) {
          this.flowStart.onEdit(data)
        } else {
          this.flowStart = new FlowStart(data[metaType])
        }
        this.mataFlowJson.flow[FlowMetaType.START] = this.flowStart
        break;
      case FlowMetaType.ASSIGNMENT:
        if (metaFieldType === MetaFieldType.ADD) {
          this.flowAssignments.push(new FlowAssignment(data))
        } else if (metaFieldType === MetaFieldType.EDIT) {
          this.flowAssignments.forEach((assignment) => {
            if (assignment.id === nodeId) assignment.onEdit(data)
          })
        } else if (metaFieldType === MetaFieldType.REMOVE) {
          this.flowAssignments = this.flowAssignments.filter((assignment) => assignment.id !== nodeId)
        } else {
          data[metaType]?.forEach((assignment: FlowAssignment) => {
            this.flowAssignments.push(new FlowAssignment(assignment))
          });
        }
        this.mataFlowJson.flow[FlowMetaType.ASSIGNMENT] = this.flowAssignments
        break;
      case FlowMetaType.DECISION:
        if (metaFieldType === MetaFieldType.ADD) {
          this.flowDecisions.push(new FlowDecision(data))
        } else if (metaFieldType === MetaFieldType.EDIT) {
          this.flowDecisions.forEach((decision) => {
            if (decision.id === nodeId) decision.onEdit(data)
          })
        } else if (metaFieldType === MetaFieldType.REMOVE) {
          this.flowDecisions = this.flowDecisions.filter((decision) => decision.id !== nodeId)
        } else {
          data[metaType]?.forEach((decision: FlowDecision) => {
            this.flowDecisions.push(new FlowDecision(decision))
          });
        }
        this.mataFlowJson.flow[FlowMetaType.DECISION] = this.flowDecisions
        break;
      case FlowMetaType.WAIT:
        if (metaFieldType === MetaFieldType.ADD) {
          this.flowSuspends.push(new FlowSuspend(data))
        } else if (metaFieldType === MetaFieldType.EDIT) {
          this.flowSuspends.forEach((suspend) => {
            if (suspend.id === nodeId) suspend.onEdit(data)
          })
        } else if (metaFieldType === MetaFieldType.REMOVE) {
          this.flowSuspends = this.flowSuspends.filter((suspend) => suspend.id !== nodeId)
        } else {
          data[metaType]?.forEach((suspend: FlowSuspend) => {
            this.flowSuspends.push(new FlowSuspend(suspend));
          });
        }
        this.mataFlowJson.flow[FlowMetaType.WAIT] = this.flowSuspends
        break;
      case FlowMetaType.LOOP:
        if (metaFieldType === MetaFieldType.ADD) {
          this.flowLoops.push(new FlowLoop(data))
        } else if (metaFieldType === MetaFieldType.EDIT) {
          this.flowLoops.forEach((loop) => {
            if (loop.id === nodeId) loop.onEdit(data)
          })
        } else if (metaFieldType === MetaFieldType.REMOVE) {
          this.flowLoops = this.flowLoops.filter((loop) => loop.id !== nodeId)
        } else {
          data[metaType]?.forEach((loop: FlowLoop) => {
            this.flowLoops.push(new FlowLoop(loop))
          });
        }
        this.mataFlowJson.flow[FlowMetaType.LOOP] = this.flowLoops
        break;
      case FlowMetaType.SORT_COLLECTION_PROCESSOR:
        if (metaFieldType === MetaFieldType.ADD) {
          this.flowSortCollections.push(new FlowSortCollectionProcessor(data))
        } else if (metaFieldType === MetaFieldType.EDIT) {
          this.flowSortCollections.forEach((sortCollention) => {
            if (sortCollention.id === nodeId) sortCollention.onEdit(data)
          })
        } else if (metaFieldType === MetaFieldType.REMOVE) {
          this.flowSortCollections = this.flowSortCollections.filter((sortCollention) => sortCollention.id !== nodeId)
        } else {
          data[metaType]?.forEach((sortCollention: FlowSortCollectionProcessor) => {
            this.flowSortCollections.push(new FlowSortCollectionProcessor(sortCollention))
          });
        }
        this.mataFlowJson.flow[FlowMetaType.SORT_COLLECTION_PROCESSOR] = this.flowSortCollections
        break;
      case FlowMetaType.RECORD_CREATE:
        if (metaFieldType === MetaFieldType.ADD) {
          this.recordCreates.push(new RecordCreate(data))
        } else if (metaFieldType === MetaFieldType.EDIT) {
          this.recordCreates.forEach((record) => {
            if (record.id === nodeId) record.onEdit(data)
          })
        } else if (metaFieldType === MetaFieldType.REMOVE) {
          this.recordCreates = this.recordCreates.filter((record) => record.id !== nodeId)
        } else {
          data[metaType]?.forEach((record: RecordCreate) => {
            this.recordCreates.push(new RecordCreate(record))
          });
        }
        this.mataFlowJson.flow[FlowMetaType.RECORD_CREATE] = this.recordCreates
        break;
      case FlowMetaType.RECORD_DELETE:
        if (metaFieldType === MetaFieldType.ADD) {
          this.recordDeletes.push(new RecordDelete(data))
        } else if (metaFieldType === MetaFieldType.EDIT) {
          this.recordDeletes.forEach((record) => {
            if (record.id === nodeId) record.onEdit(data)
          })
        } else if (metaFieldType === MetaFieldType.REMOVE) {
          this.recordDeletes = this.recordDeletes.filter((record) => record.id !== nodeId)
        } else {
          data[metaType]?.forEach((record: RecordDelete) => {
            this.recordDeletes.push(new RecordDelete(record))
          });
        }
        this.mataFlowJson.flow[FlowMetaType.RECORD_DELETE] = this.recordDeletes
        break;
      case FlowMetaType.RECORD_LOOKUP:
        if (metaFieldType === MetaFieldType.ADD) {
          this.recordLookups.push(new RecordLookup(data))
        } else if (metaFieldType === MetaFieldType.EDIT) {
          this.recordLookups.forEach((record) => {
            if (record.id === nodeId) record.onEdit(data)
          })
        } else if (metaFieldType === MetaFieldType.REMOVE) {
          this.recordLookups = this.recordLookups.filter((record) => record.id !== nodeId)
        } else {
          data[metaType]?.forEach((record: RecordLookup) => {
            this.recordLookups.push(new RecordLookup(record))
          });
        }
        this.mataFlowJson.flow[FlowMetaType.RECORD_LOOKUP] = this.recordLookups
        break;
      case FlowMetaType.RECORD_UPDATE:
        if (metaFieldType === MetaFieldType.ADD) {
          this.recordUpdates.push(new RecordUpdate(data))
        } else if (metaFieldType === MetaFieldType.EDIT) {
          this.recordUpdates.forEach((record) => {
            if (record.id === nodeId) record.onEdit(data)
          })
        } else if (metaFieldType === MetaFieldType.REMOVE) {
          this.recordUpdates = this.recordUpdates.filter((record) => record.id !== nodeId)
        } else {
          data[metaType]?.forEach((record: RecordUpdate) => {
            this.recordUpdates.push(new RecordUpdate(record))
          });
        }
        this.mataFlowJson.flow[FlowMetaType.RECORD_UPDATE] = this.recordUpdates
        break;
      case IFlowResourceType.VARIABLE:
        this.flowVariables = data[metaType] || []
        this.mataFlowJson.flow[IFlowResourceType.VARIABLE] = this.flowVariables
        break;
      case IFlowResourceType.CONSTANT:
        this.flowConstants = data[metaType] || []
        this.mataFlowJson.flow[IFlowResourceType.CONSTANT] = this.flowConstants
        break;
      case IFlowResourceType.FORMULA:
        this.flowFormulas = data[metaType] || []
        this.mataFlowJson.flow[IFlowResourceType.FORMULA] = this.flowFormulas
        break;
      case IFlowResourceType.TEMPLATE:
        this.flowTemplates = data[metaType] || []
        this.mataFlowJson.flow[IFlowResourceType.TEMPLATE] = this.flowTemplates
        break;
      default:
        break;
    }
    console.log(this.flowAssignments, this.mataFlowJson)
  }

  addFlowMeta = (metaType: IFlowResourceType, flowMeta: IFieldMeta) => {
    switch (metaType) {
      case IFlowResourceType.VARIABLE:
        this.flowVariables = update(this.flowVariables, { $push: [flowMeta] })
        this.mataFlowJson.flow[IFlowResourceType.VARIABLE] = this.flowVariables
        break;
      case IFlowResourceType.CONSTANT:
        this.flowConstants = update(this.flowConstants, { $push: [flowMeta] })
        this.mataFlowJson.flow[IFlowResourceType.CONSTANT] = this.flowConstants
        break;
      case IFlowResourceType.FORMULA:
        this.flowFormulas = update(this.flowFormulas, { $push: [flowMeta] })
        this.mataFlowJson.flow[IFlowResourceType.FORMULA] = this.flowFormulas
        break;
      case IFlowResourceType.TEMPLATE:
        this.flowTemplates = update(this.flowTemplates, { $push: [flowMeta] })
        this.mataFlowJson.flow[IFlowResourceType.TEMPLATE] = this.flowTemplates
        break;
      default:
        break;
    }
    // this.history.push(this.mataFlowJson.flow)
  }

  editFlowMeta = (metaType: IFlowResourceType, flowMeta: IFieldMeta, quoteId: string) => {
    let index = 0
    switch (metaType) {
      case IFlowResourceType.VARIABLE:
        index = this.flowVariables?.findIndex(val => val.key === quoteId)
        this.flowVariables = update(this.flowVariables, { [index]: { $set: flowMeta } })
        this.mataFlowJson.flow[IFlowResourceType.VARIABLE] = this.flowVariables
        break;
      case IFlowResourceType.CONSTANT:
        index = this.flowConstants?.findIndex(val => val.key === quoteId)
        this.flowConstants = update(this.flowConstants, { [index]: { $set: flowMeta } })
        this.mataFlowJson.flow[IFlowResourceType.CONSTANT] = this.flowConstants
        break;
      case IFlowResourceType.FORMULA:
        index = this.flowFormulas?.findIndex(val => val.key === quoteId)
        this.flowFormulas = update(this.flowFormulas, { [index]: { $set: flowMeta } })
        this.mataFlowJson.flow[IFlowResourceType.FORMULA] = this.flowFormulas
        break;
      case IFlowResourceType.TEMPLATE:
        index = this.flowTemplates?.findIndex(val => val.key === quoteId)
        this.flowTemplates = update(this.flowTemplates, { [index]: { $set: flowMeta } })
        this.mataFlowJson.flow[IFlowResourceType.TEMPLATE] = this.flowTemplates
        break;
      default:
        break;
    }
    if (flowMeta.key !== quoteId) QuoteMetaOfUpdate(this, flowMeta, quoteId)
    // this.history.push(this.mataFlowJson.flow)
  }

  get fieldMetas() {
    return this.getFieldMetas()
  }

  getFieldMetas = (fieldMetaType?: IFlowResourceType) => {
    let metas: IFieldGroupMeta[] = []
    this.flowVariables?.forEach((meta: IFieldMeta) => {
      if (meta?.type === MetaValueType.ARRAY) {
        if (meta?.items?.type === MetaValueType.OBJECT || meta?.items?.type  === MetaValueType.OBJECT_ID) {
          const obj: IFieldMetaFlow = { ...meta }
          obj.webType = IFlowResourceType.VARIABLE_ARRAY_RECORD
          metas = this.setFieldMeta(metas, obj, IFlowResourceType.VARIABLE_ARRAY_RECORD, fieldMetaType)
        } else {
          const obj: IFieldMetaFlow = { ...meta }
          obj.webType = IFlowResourceType.VARIABLE_ARRAY
          metas = this.setFieldMeta(metas, obj, IFlowResourceType.VARIABLE_ARRAY, fieldMetaType)
        }
      } else if (meta?.type === MetaValueType.OBJECT || meta?.type  === MetaValueType.OBJECT_ID) {
        const obj: IFieldMetaFlow = { ...meta }
        obj.webType = IFlowResourceType.VARIABLE_RECORD
        metas = this.setFieldMeta(metas, obj, IFlowResourceType.VARIABLE_RECORD, fieldMetaType)
      } else {
        const obj: IFieldMetaFlow = { ...meta }
        obj.webType = IFlowResourceType.VARIABLE
        metas = this.setFieldMeta(metas, obj, IFlowResourceType.VARIABLE, fieldMetaType)
      }
    });
    this.flowConstants?.forEach((meta: IFieldMeta) => {
      metas = this.setFieldMeta(metas, meta, IFlowResourceType.CONSTANT, fieldMetaType)
    });
    this.flowFormulas?.forEach((meta: IFieldMeta) => {
      metas = this.setFieldMeta(metas, meta, IFlowResourceType.FORMULA, fieldMetaType)
    });
    this.flowTemplates?.forEach((meta: IFieldMeta) => {
      metas = this.setFieldMeta(metas, meta, IFlowResourceType.TEMPLATE, fieldMetaType)
    });
    this.recordCreates?.forEach((record: RecordCreate) => {
      const register = this.registers.find((reg) => reg.id === record.registerId)
      let resourceData: IFieldMetaFlow = {
        name: `来自${record.id}的 ${register?.name}Id`,
        webType: IFlowResourceType.VARIABLE,
        type: MetaValueType.STRING,
        key: record.id,
        flowMetaType: FlowMetaType.RECORD_CREATE,
        refRegisterId: register?.id,
      }
      metas = this.setFieldMeta(metas, resourceData, IFlowResourceType.VARIABLE, fieldMetaType)
    })
    this.recordLookups?.forEach((record: RecordLookup) => {
      if (!record.outputAssignments && (record.storeOutputAutomatically || (record.queriedFields && !record.outputReference))) {
        const register = this.registers.find((reg) => reg.id === record.registerId)
        let resourceData: IFieldMetaFlow = {
          name: `来自${record.id}的 ${register?.name}`,
          webType: record.getFirstRecordOnly ? IFlowResourceType.VARIABLE_RECORD : IFlowResourceType.VARIABLE_ARRAY_RECORD,
          type: record.getFirstRecordOnly ? MetaValueType.OBJECT_ID : MetaValueType.ARRAY,
          key: record.id,
          flowMetaType: FlowMetaType.RECORD_LOOKUP,
          refRegisterId: register?.id,
        }
        if (resourceData.type === MetaValueType.ARRAY) {
          resourceData = {
            ...resourceData,
            items: {
              type: MetaValueType.OBJECT
            }
          }
        }
        const type = record.getFirstRecordOnly ? IFlowResourceType.VARIABLE_RECORD : IFlowResourceType.VARIABLE_ARRAY_RECORD
        metas = this.setFieldMeta(metas, resourceData, type, fieldMetaType)
      }
    });
    return metas
  }

  setFieldMeta = (fieldMetas: IFieldGroupMeta[] ,fieldMeta: IFieldMeta, type: IFlowResourceType, fieldMetaType?: IFlowResourceType) => {
    const idx = fieldMetas.findIndex((meta) => meta?.value === type)
    const meta = clone(fieldMeta)
    // if (!meta.options && !fieldMetaType) {
    //   meta.options = this.getFieldMetas(fieldMeta.type as IFlowResourceType)
    // }
    const templateObj: any = {
      [IFlowResourceType.VARIABLE]: useLocale('flow.autoFlow.variable'),
      [IFlowResourceType.VARIABLE_RECORD]: useLocale('flow.autoFlow.variableRecord'),
      [IFlowResourceType.VARIABLE_ARRAY]: useLocale('flow.autoFlow.variableArray'),
      [IFlowResourceType.VARIABLE_ARRAY_RECORD]: useLocale('flow.autoFlow.variableArrayRecord'),
      [IFlowResourceType.CONSTANT]: useLocale('flow.autoFlow.constant'),
      [IFlowResourceType.FORMULA]: useLocale('flow.autoFlow.formula'),
      [IFlowResourceType.TEMPLATE]: useLocale('flow.autoFlow.template'),
    }
    // if ((fieldMetaType === IFlowResourceType.VARIABLE_ARRAY
    //   || fieldMetaType === IFlowResourceType.VARIABLE_ARRAY_RECORD)
    //   && meta.type === fieldMetaType) {
    //   this.filterFieldMetas(templateObj, fieldMetas, meta, idx, type)
    // } else if (fieldMetaType === meta.type
    //   && (meta?.items?.type === MetaValueType.OBJECT_ID
    //   || meta?.items?.type === MetaValueType.OBJECT)) {
    //   this.filterFieldMetas(templateObj, fieldMetas, meta, idx, type)
    // } else if (meta.type === fieldMetaType) {
    //   this.filterFieldMetas(templateObj, fieldMetas, meta, idx, type)
    // } else if (!fieldMetaType) {
    //   if (idx > -1) {
    //     fieldMetas[idx].children.push(meta)
    //   } else {
    //     fieldMetas.push({
    //       label: templateObj[type],
    //       value: type,
    //       children: [meta],
    //     })
    //   }
    // }
    if (idx > -1) {
      fieldMetas[idx].children.push(meta)
    } else {
      fieldMetas.push({
        label: templateObj[type],
        value: type,
        children: [meta],
      })
    }
    return fieldMetas
  }

  filterFieldMetas = (templateObj: any, fieldMetas: IFieldGroupMeta[], meta: IFieldMeta, idx: number, type: IFlowResourceType) => {
    if (idx > -1) {
      const children = fieldMetas[idx].children as unknown as IFieldOption[]
      children.push({
        label: meta.name,
        value: meta.key
      })
    } else {
      fieldMetas.push({
        label: templateObj[type],
        value: type,
        children: [{
          label: meta.name,
          value: meta.key
        } as any],
      })
    }
    return fieldMetas
  }

  get formulaMap() {
    let formulaMeta: Record<string, IFieldMeta> = {}
    this.flowVariables?.forEach((meta: IFieldMeta) => {
      formulaMeta = this.getFormulaMap(formulaMeta, meta)
    });
    this.flowConstants?.forEach((meta: IFieldMeta) => {
      formulaMeta = this.getFormulaMap(formulaMeta, meta)
    });
    this.flowFormulas?.forEach((meta: IFieldMeta) => {
      formulaMeta = this.getFormulaMap(formulaMeta, meta)
    });
    this.flowTemplates?.forEach((meta: IFieldMeta) => {
      formulaMeta = this.getFormulaMap(formulaMeta, meta)
    });
    this.recordCreates?.forEach((record: RecordCreate) => {
      const register = this.registers.find((reg) => reg.id === record.registerId)
      let resourceData: IFieldMetaFlow = {
        name: `来自${record.id}的 ${register?.name}Id`,
        webType: IFlowResourceType.VARIABLE,
        type: MetaValueType.STRING,
        key: record.id,
        flowMetaType: FlowMetaType.RECORD_CREATE,
      }
      formulaMeta = this.getFormulaMap(formulaMeta, resourceData)
    })
    this.recordLookups?.forEach((record: RecordLookup) => {
      if (!record.outputAssignments && (record.storeOutputAutomatically || (record.queriedFields && !record.outputReference))) {
        const register = this.registers.find((reg) => reg.id === record.registerId)
        let resourceData: IFieldMetaFlow = {
          name: `来自${record.id}的 ${register.name}`,
          webType: record.getFirstRecordOnly ? IFlowResourceType.VARIABLE_RECORD : IFlowResourceType.VARIABLE_ARRAY_RECORD,
          type: record.getFirstRecordOnly ? MetaValueType.OBJECT_ID : MetaValueType.ARRAY,
          key: record.id,
          refRegisterId: register?.id,
        }
        if (resourceData.type === MetaValueType.ARRAY) {
          resourceData.items = {
            type: MetaValueType.OBJECT,
            properties: register?.properties
          }
        } else {
          resourceData.properties = register?.properties
        }
        formulaMeta = this.getFormulaMap(formulaMeta, resourceData)
      }
    });
    return formulaMeta
  }

  getFormulaMap = (formulaMeta: Record<string, IFieldMeta>, meta: IFieldMeta, isProperty?: boolean) => {
    // const key = isProperty ? meta.key :`$${meta.key}`
    const key = meta.key
    const obj = {
      [key]: {
        key: meta.key,
        name: meta.name,
        type: meta.type,
        properties: {},
      }
    }
    if (meta.properties && isObj(meta.properties)) {
      for (const proKey in meta.properties) {
        if (meta.properties.hasOwnProperty(proKey)) {
          const p = meta.properties[proKey]
          this.getFormulaMap(obj[key].properties, p, true)
        }
      }
    } else if (isObj(meta?.items?.properties)) {
      for (const proKey in meta?.items?.properties) {
        if (meta?.items?.properties.hasOwnProperty(proKey)) {
          const p = meta?.items?.properties[proKey]
          this.getFormulaMap(obj[key].properties, p, true)
        }
      }
    }
    return Object.assign(formulaMeta, obj)
  }


  // 按targets顺序进行flowNodes实例化
  setFlowData = (flowDatas: any[], target?: FlowMetaParamOfType, forkData?: FlowMetaParamOfType) => { 
    if (!target) {
      flowDatas.forEach((flowData, index) => {
        if (flowData.flowType === FlowMetaType.START) {
          this.initFlowNodes(flowData.flowType, flowData)
          const filterFlowDatas = flowDatas.filter(data => data.id !== flowData.id)
          if (filterFlowDatas.length > 0) this.setFlowData(filterFlowDatas, flowData);
        } 
      })
    } else if (target?.flowType === FlowMetaType.DECISION || target?.flowType === FlowMetaType.WAIT) {
      if (this.flowNodes.find(node => node.id === target.id)) {
        const rules = target?.rules || target?.waitEvents
        rules?.some((rule) => {
          const flowData = flowDatas.find(data => data.id === rule.connector?.targetReference)
          if (flowData && rule.connector?.targetReference)
            this.filterFlowData(rule.connector?.targetReference, flowDatas, flowData, target)
        })
        const defaultConnector = target?.defaultConnector?.targetReference
        const targetReference = target?.connector?.targetReference
        if (defaultConnector) {
          const flowData = flowDatas.find(data => data.id === defaultConnector)
          if (flowData) this.filterFlowData(defaultConnector, flowDatas, flowData, target)
        }
        if (targetReference) {
          const flowData = flowDatas.find(data => data.id === targetReference)
          if (flowData) {
            this.filterFlowData(targetReference, flowDatas, flowData, forkData)
          }
        }
      }
    } else if (target?.flowType === FlowMetaType.LOOP) {
      const targetReference = target?.nextValueConnector?.targetReference
      const defaultConnector = target?.defaultConnector?.targetReference
      if (targetReference) {
        const flowData = flowDatas.find(data => data.id === targetReference)
        if (flowData) this.filterFlowData(targetReference, flowDatas, flowData, forkData)
      }
      if (defaultConnector) {
        const flowData = flowDatas.find(data => data.id === defaultConnector)
        if (flowData) this.filterFlowData(defaultConnector, flowDatas, flowData, forkData)
      }
    } else {
      // const targetReference = target?.flowType === FlowMetaType.LOOP ?
      //   target?.nextValueConnector?.targetReference : target?.connector?.targetReference
      const targetReference = target?.connector?.targetReference
      const defaultConnector = target?.defaultConnector?.targetReference
      const faultConnector = target?.faultConnector?.targetReference
      const flowData = flowDatas.find(data => data.id === targetReference)
      if (flowData && targetReference) {
        this.filterFlowData(targetReference, flowDatas, flowData, forkData)
      } else if (faultConnector) {
        const flowData = flowDatas.find(data => data.id === faultConnector)
        if (flowData) {
          this.filterFlowData(faultConnector, flowDatas, flowData, forkData)
        }
      } else if (defaultConnector) {
        const flowData = flowDatas.find(data => data.id === defaultConnector)
        if (flowData) {
          this.filterFlowData(defaultConnector, flowDatas, flowData, forkData)
        }
      }
    }
  }

  // 返回上一层
  // returnUpper = (targetReference: string, flowDatas: any[], forkData?: FlowMetaParamOfType) => {
  //   const flowData = this.metaFlowDatas.find(data => data.id === targetReference)
  //   if (flowData && targetReference) this.filterFlowData(targetReference, flowDatas, flowData, forkData)
  // }

  getFlowData = (flowDatas: any[], target?: FlowMetaParamOfType, forkData?: FlowMetaParamOfType) => {
    const flowData = this.metaFlowDatas.find(data => data.id === target?.defaultConnector?.targetReference)
    const flowMeta = flowDatas.find(data => data.id === flowData?.id)
    if (flowMeta) {
      this.setFlowData(flowDatas, target, forkData)
    } else {
      this.getFlowData(flowDatas, flowData, forkData)
    }
  }

  filterFlowData = (targetReference: string, flowDatas: any[], flowData: any, forkData?: FlowMetaParamOfType) => {
    const filterFlowDatas = flowDatas.filter(data => data.id !== targetReference)
    const flowNode = this.flowNodes.find(node => node.id === targetReference)
    if (!flowNode && targetReference !== forkData?.connector?.targetReference) {
      const time = new Date().getTime()
      this.initFlowNodes(flowData.flowType, flowData, undefined, forkData)
      const time1 = new Date().getTime()
      console.log(time1 - time, 112323323232332323)
      if (filterFlowDatas.length > 0) this.setFlowData(filterFlowDatas, flowData, forkData);
    } else {
      return
    }
    // if (flowNode) {
    //   if (filterFlowDatas.length > 0) this.getFlowData(filterFlowDatas, flowData, forkData);
    // } else {
    //   this.initFlowNodes(flowData.flowType, flowData, undefined, forkData?.id)
    //   if (filterFlowDatas.length > 0) this.setFlowData(filterFlowDatas, flowData, forkData);
    // }
  }

  initFlowNodes(metaType: FlowMetaType, flowData: FlowMetaParam, flowNode?: NodeProps, fork?: FlowMetaParam) {
    const loopBack = this.loopBackNode(flowData, flowNode);
    let loopLastData = undefined
    if (!flowNode) {
      loopLastData = this.flowNodes.find((data: any) => {
        if (flowData?.connector) {
          return flowData?.connector?.targetReference === data.id
            && flowData?.connector?.targetReference !== fork?.connector?.targetReference
        } else if (flowData?.nextValueConnector) {
          return flowData?.defaultConnector?.targetReference === data.id
            && flowData?.defaultConnector?.targetReference !== fork?.connector?.targetReference
        }
        return false
      })
    }
    switch (metaType) {
      case FlowMetaType.START:
        this.setStarts(flowData)
        break;
      case FlowMetaType.ASSIGNMENT:
        this.setBaseInfos(flowData, metaType, loopBack, loopLastData, fork)
        break;
      case FlowMetaType.DECISION:
      case FlowMetaType.WAIT:
        this.setDecisions(flowData, metaType, loopBack, loopLastData, fork)
        break;
      case FlowMetaType.LOOP:
        this.setLoops(flowData, loopBack, loopLastData, fork)
        break;
      case FlowMetaType.SORT_COLLECTION_PROCESSOR:
        this.setBaseInfos(flowData, metaType, loopBack, loopLastData, fork)
        break;
      case FlowMetaType.RECORD_CREATE:
      case FlowMetaType.RECORD_DELETE:
      case FlowMetaType.RECORD_LOOKUP:
      case FlowMetaType.RECORD_UPDATE:
        this.setBaseInfos(flowData, metaType, loopBack, loopLastData, fork)
        break;
      default:
        break;
    }
  }

  setStarts(flowData: FlowMetaParam) {
    const id = this.isEdit ? uid() : flowData?.connector?.targetReference || this.flowEndId
    this.flowNodes.push({
      id: flowData.id,
      type: 'begin',
      width: STAND_SIZE,
      height: STAND_SIZE,
      targets: [id],
      component: 'StartNode',
    })
    if (this.isEdit) {
      this.flowNodes.push(
        {
          id,
          type: 'forward',
          width: STAND_SIZE,
          height: STAND_SIZE,
          targets: [flowData?.connector?.targetReference || this.flowEndId],
          component: 'ExtendNode',
        }
      )
    }
  }

  setDecisions(flowData: FlowMetaParam, metaType: FlowMetaType, loopBackNode: NodeProps | undefined, loopLastData?: NodeProps, fork?: FlowMetaParam) {
    const forkNode = this.flowNodes.find(node => node.id === fork?.id)
    const decisionEndId = forkNode?.decisionEndTarget
    const endId = this.isEdit ? uid() : flowData?.connector?.targetReference || decisionEndId || this.flowEndId
    let componentName = undefined
    switch (metaType) {
      case FlowMetaType.DECISION:
        componentName = 'DecisionNode'
        break;
      case FlowMetaType.WAIT:
        componentName = 'SuspendNode'
        break;
    default:
        break;
    }
    const connectorId = flowData?.defaultConnector?.targetReference !== fork?.connector?.targetReference
      && flowData?.defaultConnector?.targetReference !== flowData.connector?.targetReference && flowData?.defaultConnector?.targetReference
    let targetId = connectorId || endId
    if (!this.isEdit) {
      const node = this.flowNodes.find(node => node.id === flowData.connector?.targetReference)
      if (node) targetId = node.loopEndTarget as any
    }
    const decisionEndTarget = [loopBackNode?.id ? loopBackNode.id :
      (loopLastData?.loopBackTarget ? loopLastData.loopBackTarget : targetId)]
    const decisions: NodeProps[] = [{
      id: flowData.id,
      type: 'decisionBegin',
      decisionEndTarget: loopBackNode?.id ? loopBackNode.id :
        (loopLastData?.loopBackTarget ? loopLastData.loopBackTarget : endId),
      width: STAND_SIZE,
      height: STAND_SIZE,
      targets: [],
      label: flowData.id,
      component: componentName,
      onClick: () => console.log('this is', flowData.id)
    }]
    const ids: string[] = []
    const rules = flowData.rules || flowData.waitEvents
    rules?.forEach((rule) => {
      ids.push(rule.id)
      const opartId = uid()
      const connectorId = rule?.connector?.targetReference !== fork?.connector?.targetReference
        && rule?.connector?.targetReference !== flowData.connector?.targetReference && rule?.connector?.targetReference
      decisions.push({
        id: rule.id,
        type: 'forward',
        width: STAND_SIZE,
        height: STAND_SIZE,
        targets: [this.isEdit ? opartId : connectorId || (loopBackNode ? loopBackNode.id :
          (loopLastData?.loopBackTarget ? loopLastData.loopBackTarget : endId))],
        component: 'LabelNode',
      })
      if (this.isEdit) {
        decisions.push({
          id: opartId,
          type: 'forward',
          width: STAND_SIZE,
          height: STAND_SIZE,
          targets: [connectorId || (loopBackNode ? loopBackNode.id :
            (loopLastData?.loopBackTarget ? loopLastData.loopBackTarget : endId))],
          component: 'ExtendNode',
        })
      }
    })
    const id = uid()
    const defaultId = uid()
    ids.push(id)
    decisions.push(
      {
        id,
        type: 'forward',
        width: STAND_SIZE,
        height: STAND_SIZE,
        targets: this.isEdit ? [defaultId] : connectorId ? [connectorId] : decisionEndTarget,
        component: 'LabelNode',
      }
    )
    if (this.isEdit) {
      decisions.push(
        {
          id: defaultId,
          type: 'forward',
          width: STAND_SIZE,
          height: STAND_SIZE,
          targets: connectorId ? [connectorId] : decisionEndTarget,
          component: 'ExtendNode',
        }
      )
    }
    if (!loopBackNode && !loopLastData && this.isEdit) {
      const connectorId = flowData?.connector?.targetReference !== fork?.connector?.targetReference
        && flowData?.connector?.targetReference
      decisions.push({
        id: endId,
        type: 'decisionEnd',
        width: STAND_SIZE,
        height: STAND_SIZE,
        targets: [connectorId || decisionEndId || this.flowEndId],
        component: 'ExtendNode',
      })
    }
    decisions[0].targets = ids
    this.flowNodes.push(...decisions)
    console.log(this.flowNodes, '111111111222222')
  }

  getLoopBackId(flowData: FlowMetaParam, targetReference: any): string | null {
    const meta = this.metaFlowDatas.find(meta => meta.id === targetReference)
    if (meta) {
      switch (meta?.flowType) {
        case FlowMetaType.LOOP:
        case FlowMetaType.DECISION:
        case FlowMetaType.WAIT:
          if (meta?.defaultConnector?.targetReference === flowData.id) return meta.id
          return this.getLoopBackId(flowData, meta?.defaultConnector?.targetReference)
        default:
          if (meta?.connector?.targetReference === flowData.id) return meta.id
          return this.getLoopBackId(flowData, meta?.connector?.targetReference)
      }
    }
    return null
  }

  setLoops(flowData: FlowMetaParam, loopBackNode: NodeProps | undefined, loopLastData?: NodeProps, fork?: FlowMetaParam) {
    const forkNode = this.flowNodes.find(node => node.id === fork?.id)
    const decisionEndId = forkNode?.decisionEndTarget
    const backId = uid()
    const endId = uid()
    const backLabelId = uid()
    const endLabelId = uid()
    const id = uid()
    let loopBackTarget = null
    const connectorId = flowData?.defaultConnector?.targetReference !== fork?.connector?.targetReference
      && flowData?.defaultConnector?.targetReference
    let targetId = connectorId || decisionEndId || this.flowEndId
    if (!this.isEdit) {
      const targetReference = flowData.nextValueConnector?.targetReference
      loopBackTarget = this.getLoopBackId(flowData, targetReference)
      const node = this.flowNodes.find(node => node.id === flowData.defaultConnector?.targetReference)
      if (node) targetId = node.loopEndTarget as any
    }
    const loopEndTarget = [loopBackNode?.id ? loopBackNode.id :
      (loopLastData?.loopBackTarget ? loopLastData.loopBackTarget : endId)]
    const loops: NodeProps[] = [{
      id: flowData.id,
      type: 'loopBegin',
      loopBackTarget: this.isEdit ? backId : backLabelId,
      loopEndTarget: this.isEdit ? loopEndTarget.join('') : loopLastData?.loopBackTarget || endLabelId,
      width: STAND_SIZE,
      height: STAND_SIZE,
      targets: [this.isEdit ? backLabelId : flowData.nextValueConnector?.targetReference || backLabelId],
      component: 'LoopNode',
    }]
    loops.push({
      id: backLabelId,
      type: this.isEdit ? 'forward' : 'loopBack',
      width: STAND_SIZE,
      height: STAND_SIZE,
      targets: [this.isEdit ?
        (flowData?.nextValueConnector?.targetReference ? id : backId)
        : (loopBackTarget !== loopLastData?.id ? loopLastData?.loopBackTarget || endLabelId : loopBackTarget || endLabelId)],
      component: 'LabelNode',
    })
    if (this.isEdit || (!this.isEdit && !loopLastData)) {
      loops.push({
        id: endLabelId,
        type: this.isEdit ? 'forward' : 'loopEnd',
        width: STAND_SIZE,
        height: STAND_SIZE,
        targets: [this.isEdit ? loopEndTarget.join('') : loopLastData?.loopBackTarget || targetId],
        component: 'LabelNode',
      })
    }
    if (flowData?.nextValueConnector?.targetReference && this.isEdit) {
      const extendNode: NodeProps = {
        id,
        type: 'forward',
        width: STAND_SIZE,
        height: STAND_SIZE,
        targets: [flowData?.nextValueConnector?.targetReference],
        component: 'ExtendNode',
      }
      loops.push(extendNode);
    }
    if (this.isEdit) {
      loops.push({
        id: backId,
        type: 'loopBack',
        width: STAND_SIZE,
        height: STAND_SIZE,
        targets: [endLabelId],
        component: 'ExtendNode',
      })
    }
    if (!loopBackNode && !loopLastData) {
      if (this.isEdit) {
        loops.push({
          id: endId,
          type: 'loopEnd',
          width: STAND_SIZE,
          height: STAND_SIZE,
          targets: [targetId],
          component: 'ExtendNode',
        })
      }
    }
    this.flowNodes.push(...loops)
  }

  setBaseInfos(targetNode: FlowMetaParam, metaType: FlowMetaType, loopBackNode: NodeProps | undefined, loopLastData?: NodeProps, fork?: FlowMetaParam) {
    const id = uid()
    let componentName = undefined
    switch (metaType) {
      case FlowMetaType.ASSIGNMENT:
        componentName = 'AssignNode'
        break;
      case FlowMetaType.SORT_COLLECTION_PROCESSOR:
        componentName = 'CollectionSortNode'
        break;
      case FlowMetaType.RECORD_CREATE:
        componentName = 'RecordCreateNode'
        break;
      case FlowMetaType.RECORD_DELETE:
        componentName = 'RecordDeletehNode'
        break;
      case FlowMetaType.RECORD_LOOKUP:
        componentName = 'RecordSearchNode'
        break;
      case FlowMetaType.RECORD_UPDATE:
        componentName = 'RecordEdithNode'
        break;
    default:
        break;
    }
    const forkNode = this.flowNodes.find(node => node.id === fork?.id)
    const decisionEndId = forkNode?.decisionEndTarget
    let targetId = this.isEdit ? (loopBackNode ? loopBackNode.id :
      (loopLastData?.loopBackTarget ? loopLastData.loopBackTarget : id))
      : (targetNode?.connector?.targetReference || decisionEndId || this.flowEndId)
    if (!this.isEdit) {
      const node = this.flowNodes.find(node => node.id === targetNode.connector?.targetReference)
      if (node) targetId = node.loopBackTarget as any
    }
    const recordCreates: NodeProps[] = [{
      id: targetNode.id,
      type: 'forward',
      width: STAND_SIZE,
      height: STAND_SIZE,
      targets: [targetId],
      component: componentName
    }]
    const connectorId = targetNode?.connector?.targetReference !== fork?.connector?.targetReference && targetNode?.connector?.targetReference
    if (!loopBackNode && !loopLastData) {
      if (this.isEdit) {
        recordCreates.push({
          id: id,
          type: 'forward',
          width: STAND_SIZE,
          height: STAND_SIZE,
          targets: [connectorId || decisionEndId || this.flowEndId],
          component: 'ExtendNode',
        })
      }
    }
    this.flowNodes.push(...recordCreates)
    console.log(this.flowNodes);
  }

  loopBackNode(targetNode: FlowMetaParam, flowNode?: NodeProps) {
    if (flowNode?.type === 'loopBack') {
      const id = uid()
      let type: FlowNodeType = 'forward'
      this.flowNodes?.forEach((node) => {
        const targets = node.targets
        node?.targets?.forEach((target: string, index: number) => {
          if (target === flowNode?.id) targets?.splice(index, 1, id);
        })
        node.targets = targets
        if (node.loopEndTarget === flowNode?.id) {
          type = 'loopEnd'
          node.loopEndTarget = this.isEdit ? id : targetNode.id
        } else if (node.decisionEndTarget === flowNode?.id) {
          type = 'decisionEnd'
          node.decisionEndTarget = this.isEdit ? id : targetNode.id
        }
      })
      if (this.isEdit) {
        const extendNode: NodeProps = {
          id,
          type,
          width: STAND_SIZE,
          height: STAND_SIZE,
          targets: [targetNode.id],
          component: 'ExtendNode',
        }
        this.flowNodes.push(extendNode);
      }
      return flowNode
    }
    if (flowNode) {
      this.flowNodes.forEach((node) => {
        if (node.id === flowNode.id) node.targets = [targetNode.id]
      })
    }
    return undefined
  }
}