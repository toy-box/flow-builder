/* eslint-disable react-hooks/rules-of-hooks */
import {
  define,
  observable,
  batch,
} from '@formily/reactive'
import { Flow, FlowNodeType } from '@toy-box/flow-graph';
import { IFieldMeta, IFieldGroupMeta, MetaValueType } from '@toy-box/meta-schema';
import { isArr } from '@formily/shared';
import { isNum } from '@toy-box/toybox-shared';
import update from 'immutability-helper'
import { FlowGraphMeta, FlowMetaType, FlowMetaParam, IFlowResourceType, FlowMeta } from '../types'
import { uid } from '../../utils';
import { FlowStart, FlowAssignment, FlowDecision, FlowLoop,
  FlowSortCollectionProcessor, FlowSuspend, RecordCreate,
  RecordUpdate, RecordDelete, RecordLookup } from './index'
import { useLocale } from '../../hooks'
// import { runEffects } from '../shared/effectbox'

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
  FlowMetaType.SUSPEND,
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
  INIT = 'INIT',
} 

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

  constructor(autoFlowMeta: FlowGraphMeta) {
    this.id = autoFlowMeta.id
    this.initialMeta = autoFlowMeta
    this.mataFlowJson = {
      id: autoFlowMeta.id,
      name: autoFlowMeta.name,
      flow: {}
    }
    this.flowGraph = new Flow()
    this.flowEndId = uid()
    this.makeObservable()
    this.onInit()
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
      fieldMetas: observable.computed,
      // onInit: batch,
    })
  }

  setId = (id: string) => {
    this.id = id
  }

  editFlowData = (nodeId: string, metaType: FlowMetaType, flowData: FlowMetaParam) => {
    this.flowGraph = new Flow()
    if (flowData.id !== nodeId) {
      this.flowNodes.forEach((node) => {
        if (node.targets?.includes(nodeId)) {
          node.targets = [flowData.id]
        } else if (node.id === nodeId) {
          node.id = flowData.id
        }
      })
      this.metaFlowDatas.forEach((meta) => {
        if (meta.connector?.targetReference === nodeId) {
          meta.connector.targetReference = flowData.id
          this.initMetaFields(meta.flowType, meta, MetaFieldType.EDIT, nodeId)
        } else if (meta.defaultConnector?.targetReference === nodeId) {
          meta.defaultConnector.targetReference = flowData.id
          this.initMetaFields(meta.flowType, meta, MetaFieldType.EDIT, nodeId)
        } else if (meta.nextValueConnector?.targetReference === nodeId) {
          meta.nextValueConnector.targetReference = flowData.id
          this.initMetaFields(meta.flowType, meta, MetaFieldType.EDIT, nodeId)
        }
      })
    }
    if (metaType === FlowMetaType.DECISION) {
      const flowDecision = this.flowDecisions.find((decision) => decision.id === nodeId)
      if (flowDecision) this.decisionFlowData(flowDecision, flowData, nodeId)
    } else if (metaType === FlowMetaType.SUSPEND) {
      const flowSuspend = this.flowSuspends.find((suspend) => suspend.id === nodeId)
      if (flowSuspend) this.decisionFlowData(flowSuspend, flowData, nodeId)
    }
    this.initMetaFields(metaType, flowData, MetaFieldType.EDIT, nodeId)
  }

  decisionFlowData = (flowDecision: FlowDecision | FlowSuspend, flowData: FlowMetaParam, nodeId: string) => {
    const flowNode = this.flowNodes.find((node) => node.id === nodeId)
    const targets = flowNode?.targets
    const endId = flowNode?.decisionEndTarget
    const decisions:NodeProps[] = []
    const ids: any = []
    flowDecision?.rules?.forEach((rule) => {
      if (!flowData.rules?.find((rl) => rl.id === rule.id)) {
        if (rule?.connector?.targetReference) {
          const targetReference = rule.connector.targetReference as string
          this.flowNodes = this.flowNodes.filter((node) => !node.targets?.includes(targetReference))
          const currnetNode = this.flowNodes.find((node) => node.id === targetReference)
          this.flowNodes = this.flowNodes.filter((node) => node.id !== targetReference)
          if (currnetNode) this.removeFlowNode(currnetNode, endId)
        } else {
          this.flowNodes = this.flowNodes.filter((node) => node.id !== rule.id)
        }
      }
    })
    flowData.rules?.forEach((rl) => {
      const fn = this.flowNodes.find((node) => node.id === rl.id)
      if (!fn) {
        ids.push(rl.id)
        decisions.push({
          id: rl.id,
          type: 'forward',
          width: STAND_SIZE,
          height: STAND_SIZE,
          targets: [rl?.connector?.targetReference as any || endId],
          component: 'ExtendNode',
        })
      } else {
        ids.push(rl.id)
      }
    })
    ids.push(targets?.[targets?.length - 1])
    if (flowNode?.targets) flowNode.targets = ids
    this.flowNodes.push(...decisions)
    console.log(this.flowNodes)
  }

  removeFlowNode = (currnetNode: NodeProps, decisionEndTarget?: string) => {
    const targets = currnetNode.targets;
    targets?.forEach((target) => {
      if (target !== decisionEndTarget && decisionEndTarget) {
        const cuNode = this.flowNodes.find((node) => node.id === target)
        this.flowNodes = this.flowNodes.filter((node) => node.id !== target)
        if (cuNode) this.removeFlowNode(cuNode, decisionEndTarget)
      }
    })
  }

  updateInitialMeta = (nodeId: string, metaType: FlowMetaType, flowData: FlowMetaParam) => {
    console.log('111112323232', nodeId, metaType)
    const data = flowData
    const flowNode: NodeProps | undefined = this.flowNodes.find((node) => node.id === nodeId)
    this.updataFlowMetaData(flowNode, metaType, flowData)
    console.log(this.mataFlowJson, 'mataFlowJson')
    let cycleBeginNode = null
    if (flowNode?.type === 'loopBack') {
      cycleBeginNode = this.flowNodes.find((node) => node.loopBackTarget === nodeId)
    }
    data.connector = {
      targetReference: cycleBeginNode ? cycleBeginNode.id : (flowNode?.targets?.[0] || null)
    }
    data.defaultConnector = {
      targetReference: data?.defaultConnector?.targetReference || this.flowEndId,
    }
    if (metaType === FlowMetaType.START) {
      this.initMetaFields(metaType, data, MetaFieldType.EDIT)
      // flow[metaType] = data
    } else {
      if (metaType === FlowMetaType.LOOP) {
        data.connector = undefined
        data.nextValueConnector = {
          targetReference: null,
        }
        data.defaultConnector = {
          targetReference: cycleBeginNode ? cycleBeginNode.id : (flowNode?.targets?.[0] || null),
        }
      } else if (metaType === FlowMetaType.DECISION || metaType === FlowMetaType.SUSPEND) {
        data.defaultConnector = {
          targetReference: null,
        }
      }
    }
    this.initFlowNodes(metaType, data, flowNode)
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
    data.defaultConnector = {
      targetReference: data?.defaultConnector?.targetReference || this.flowEndId,
    }
    this.metaFlowDatas = []
    for (const key in flow) {
      if (flow.hasOwnProperty(key)) {
        const metaType = showMetaTypes.find(type => type === key)
        if (metaType) {
          if (isArr(flow[key])) {
            flow[key].forEach((data: FlowMetaParam) => {
              this.metaFlowDatas.push({
                ...data,
                flowType: metaType
              })
            })
          }
        }
      }
    }
    this.metaFlowDatas.some((meta) => {
      const forkBeginOfEndNode = this.flowNodes.find((node) => node.decisionEndTarget === flowNode?.id)
      const forkBeginOfForwardNode = this.flowNodes.find((node) => {
        return (node?.targets || []).length > 1 && flowNode?.id && (node?.targets || []).includes(flowNode?.id)
      })
      const baseNode = this.flowNodes.find((node) => {
        return node?.targets?.length === 1 && flowNode?.id && node.targets.includes(flowNode?.id)
      })
      const cycleBeginOfBackNode = this.flowNodes.find((node) => node.loopBackTarget === flowNode?.id)
      const cycleBeginOfEndNode = this.flowNodes.find((node) => node.loopEndTarget === flowNode?.id)
      const flowIdx = flow[meta.flowType].findIndex((flowMeta: FlowMetaParam) => flowMeta.id === meta.id)
      if (forkBeginOfEndNode?.id === meta.id) {
        this.updataCurrentFlowData(meta, data, metaType)
        if (flowIdx > -1) {
          const currentFlow = {
            ...flow[meta.flowType][flowIdx]
          }
          currentFlow.connector.targetReference = data.id
          this.initMetaFields(meta.flowType, currentFlow, MetaFieldType.EDIT, currentFlow.id)
        }
        return meta
      } else if ((baseNode?.id === meta.id && !cycleBeginOfBackNode)) {
        if (meta.flowType === FlowMetaType.LOOP) {
          if (metaType === FlowMetaType.LOOP && data?.defaultConnector) {
            data.defaultConnector.targetReference = meta?.id || (meta?.connector?.targetReference || null)
          } else if (data.connector) {
            data.connector.targetReference = meta?.nextValueConnector?.targetReference || (meta?.connector?.targetReference || null)
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
          this.metaFlowDatas.push({
            ...data,
            flowType: metaType
          });
        } else {
          this.updataCurrentFlowData(meta, data, metaType)
          if (flowIdx > -1) {
            const currentFlow = {
              ...flow[meta.flowType][flowIdx]
            }
            currentFlow.connector.targetReference = data.id
            this.initMetaFields(meta.flowType, currentFlow, MetaFieldType.EDIT, currentFlow.id)
          }
        }
        return meta
      } else if (forkBeginOfForwardNode?.id === meta.id) {
        const idx = meta?.rules?.findIndex((rule) => rule.id === flowNode?.id)
        if (isNum(idx) && idx > -1 && flowIdx > -1) {
          if (metaType === FlowMetaType.LOOP && data?.defaultConnector) {
            data.defaultConnector.targetReference = meta?.rules?.[idx]?.connector?.targetReference || null
          } else if (data.connector) {
            data.connector.targetReference = meta?.rules?.[idx]?.connector?.targetReference || null
          }
          this.initMetaFields(metaType, data, MetaFieldType.ADD)
          const currentFlow = {
            ...flow[meta.flowType][flowIdx]
          }
          currentFlow.rules[idx].connector.targetReference = data.id
          this.initMetaFields(meta.flowType, currentFlow, MetaFieldType.EDIT, currentFlow.id)
        } else if (flowIdx > -1) {
          if (metaType === FlowMetaType.LOOP && data?.defaultConnector) {
            data.defaultConnector.targetReference = flow[meta.flowType][flowIdx]?.defaultConnector?.targetReference || null
          } else if (data.connector) {
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
          this.updataCurrentFlowData(meta, data, metaType)
          const currentFlow = {
            ...flow[meta.flowType][flowIdx]
          }
          currentFlow.nextValueConnector.targetReference = data.id
          this.initMetaFields(meta.flowType, currentFlow, MetaFieldType.EDIT, currentFlow.id)
        } else {
          this.updataCurrentFlowData(meta, data, metaType)
          const node = this.flowNodes.find((nd) => nd?.targets?.[0] === flowNode?.id)
          const mTData = this.metaFlowDatas.find((mt) => mt.id === node?.id)
          const mtIdx = mTData?.flowType && flow[mTData?.flowType].findIndex((flowMeta: FlowMetaParam) => flowMeta.id === mTData?.id)
          if (mTData && mtIdx && mTData.flowType === FlowMetaType.LOOP) {
            const currentFlow = {
              ...flow[mTData.flowType][mtIdx]
            }
            currentFlow.defaultConnector.targetReference = data.id
            this.initMetaFields(mTData.flowType, currentFlow, MetaFieldType.EDIT, currentFlow.id)
            // flow[mTData.flowType][mtIdx].defaultConnector.targetReference = data.id
          } else if (mTData && mtIdx) {
            const currentFlow = {
              ...flow[mTData.flowType][mtIdx]
            }
            currentFlow.connector.targetReference = data.id
            this.initMetaFields(mTData.flowType, currentFlow, MetaFieldType.EDIT, currentFlow.id)
            // flow[mTData.flowType][mtIdx].connector.targetReference = data.id
          }
        }
        return meta
      } else if (cycleBeginOfEndNode?.id === meta.id) {
        this.updataCurrentFlowData(meta, data, metaType)
        const currentFlow = {
          ...flow[meta.flowType][flowIdx]
        }
        currentFlow.defaultConnector.targetReference = data.id
        this.initMetaFields(meta.flowType, currentFlow, MetaFieldType.EDIT, currentFlow.id)
        return meta
      }
    })
  }

  updataCurrentFlowData = (meta: FlowMetaParamOfType, data: FlowMetaParam, metaType: FlowMetaType, ) => {
    // const flow = this.initialMeta.flow as any
    if (meta.flowType !== FlowMetaType.LOOP) {
      if (metaType === FlowMetaType.LOOP && data?.defaultConnector) {
        data.defaultConnector.targetReference = meta?.connector?.targetReference || null
      } else if (data.connector) {
        data.connector.targetReference = meta?.connector?.targetReference || null
      }
    } else {
      if (metaType === FlowMetaType.LOOP && data?.defaultConnector) {
        data.defaultConnector.targetReference = meta?.id || (meta?.connector?.targetReference || null)
      } else if (data.connector) {
        data.connector.targetReference = meta?.id || (meta?.connector?.targetReference || null)
      }
    }
    console.log(metaType, meta, 'meta')
    this.initMetaFields(metaType, data, MetaFieldType.ADD)
    // flow[metaType].push(data)
    this.metaFlowDatas.push({
      ...data,
      flowType: metaType
    });
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
          } else {
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
    console.log(this.flowNodes, this.metaFlowDatas, 'end')
  }

  initMetaFields = (metaType: string, flowData: FlowMetaParam | any, metaFieldType?: MetaFieldType, nodeId?: string) => {
    const data = { ...flowData }
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
        } else {
          data[metaType].forEach((assignment: FlowAssignment) => {
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
        } else {
          data[metaType].forEach((decision: FlowDecision) => {
            this.flowDecisions.push(new FlowDecision(decision))
          });
        }
        this.mataFlowJson.flow[FlowMetaType.DECISION] = this.flowDecisions
        break;
      case FlowMetaType.SUSPEND:
        if (metaFieldType === MetaFieldType.ADD) {
          this.flowSuspends.push(new FlowSuspend(data))
        } else if (metaFieldType === MetaFieldType.EDIT) {
          this.flowSuspends.forEach((suspend) => {
            if (suspend.id === nodeId) suspend.onEdit(data)
          })
        } else {
          data[metaType].forEach((suspend: FlowSuspend) => {
            this.flowSuspends.push(new FlowSuspend(suspend))
          });
        }
        this.mataFlowJson.flow[FlowMetaType.SUSPEND] = this.flowSuspends
        break;
      case FlowMetaType.LOOP:
        if (metaFieldType === MetaFieldType.ADD) {
          this.flowLoops.push(new FlowLoop(data))
        } else if (metaFieldType === MetaFieldType.EDIT) {
          this.flowLoops.forEach((loop) => {
            if (loop.id === nodeId) loop.onEdit(data)
          })
        } else {
          data[metaType].forEach((loop: FlowLoop) => {
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
        } else {
          data[metaType].forEach((sortCollention: FlowSortCollectionProcessor) => {
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
        } else {
          data[metaType].forEach((record: RecordCreate) => {
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
        } else {
          data[metaType].forEach((record: RecordDelete) => {
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
        } else {
          data[metaType].forEach((record: RecordLookup) => {
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
        } else {
          data[metaType].forEach((record: RecordUpdate) => {
            this.recordUpdates.push(new RecordUpdate(record))
          });
        }
        this.mataFlowJson.flow[FlowMetaType.RECORD_UPDATE] = this.recordUpdates
        break;
      case IFlowResourceType.VARIABLE:
        this.flowVariables = data[metaType]
        this.mataFlowJson.flow[IFlowResourceType.VARIABLE] = this.flowVariables
        break;
      case IFlowResourceType.CONSTANT:
        this.flowConstants = data[metaType]
        this.mataFlowJson.flow[IFlowResourceType.CONSTANT] = this.flowConstants
        break;
      case IFlowResourceType.FORMULA:
        this.flowFormulas = data[metaType]
        this.mataFlowJson.flow[IFlowResourceType.FORMULA] = this.flowFormulas
        break;
      case IFlowResourceType.TEMPLATE:
        this.flowTemplates = data[metaType]
        this.mataFlowJson.flow[IFlowResourceType.TEMPLATE] = this.flowTemplates
        break;
      default:
        break;
    }
    console.log(this.flowAssignments, this.mataFlowJson)
  }

  get fieldMetas() {
    let metas: IFieldGroupMeta[] = []
    this.flowVariables.forEach((meta: IFieldMeta) => {
      if (meta?.type === MetaValueType.ARRAY) {
        if (meta?.items?.type === MetaValueType.OBJECT || meta?.items?.type  === MetaValueType.OBJECT_ID) {
          const obj = { ...meta }
          obj.type = IFlowResourceType.VARIABLE_ARRAY_RECORD
          metas = this.setFieldMeta(metas, obj, IFlowResourceType.VARIABLE_ARRAY_RECORD)
        } else {
          const obj = { ...meta }
          obj.type = IFlowResourceType.VARIABLE_ARRAY
          metas = this.setFieldMeta(metas, obj, IFlowResourceType.VARIABLE_ARRAY)
        }
      } else {
        metas = this.setFieldMeta(metas, meta, IFlowResourceType.VARIABLE)
      }
    });
    this.flowConstants.forEach((meta: IFieldMeta) => {
      metas = this.setFieldMeta(metas, meta, IFlowResourceType.CONSTANT)
    });
    this.flowFormulas.forEach((meta: IFieldMeta) => {
      metas = this.setFieldMeta(metas, meta, IFlowResourceType.FORMULA)
    });
    this.flowTemplates.forEach((meta: IFieldMeta) => {
      metas = this.setFieldMeta(metas, meta, IFlowResourceType.TEMPLATE)
    });
    return metas
  }

  setFieldMeta = (fieldMetas: IFieldGroupMeta[] ,fieldMeta: IFieldMeta, type: IFlowResourceType) => {
    const idx = fieldMetas.findIndex((meta) => meta?.value === type)
    const templateObj: any = {
      [IFlowResourceType.VARIABLE]: useLocale('flow.autoFlow.variable'),
      [IFlowResourceType.VARIABLE_ARRAY]: useLocale('flow.autoFlow.variableArray'),
      [IFlowResourceType.VARIABLE_ARRAY_RECORD]: useLocale('flow.autoFlow.variableArrayRecord'),
      [IFlowResourceType.CONSTANT]: useLocale('flow.autoFlow.constant'),
      [IFlowResourceType.FORMULA]: useLocale('flow.autoFlow.formula'),
      [IFlowResourceType.TEMPLATE]: useLocale('flow.autoFlow.template'),
    }
    if (idx > -1) {
      fieldMetas[idx].children.push(fieldMeta)
    } else {
      fieldMetas.push({
        label: templateObj[type],
        value: type,
        children: [fieldMeta],
      })
    }
    return fieldMetas
  }

  // 按targets顺序进行flowNodes实例化
  setFlowData = (flowDatas: any[], target?: FlowMetaParamOfType) => {
    if (!target) {
      flowDatas.forEach((flowData, index) => {
        if (flowData.flowType === FlowMetaType.START) {
          this.initFlowNodes(flowData.flowType, flowData)
          flowDatas.splice(index, 1)
          this.setFlowData(flowDatas, flowData);
        } 
      })
    } else {
      const targetReference = target?.flowType === FlowMetaType.LOOP ?
        target?.nextValueConnector?.targetReference : target?.connector?.targetReference
      const defaultConnector = target?.defaultConnector?.targetReference
      const flowData = flowDatas.find(data => data.id === targetReference)
      if (flowData && targetReference) {
        this.filterFlowData(targetReference, flowDatas, flowData)
      } else {
        const flowData = flowDatas.find(data => data.id === defaultConnector)
        if (flowData && defaultConnector) this.filterFlowData(defaultConnector, flowDatas, flowData)
      }
    }
  }

  filterFlowData = (targetReference: string, flowDatas: any[], flowData: any) => {
    const filterFlowDatas = flowDatas.filter(data => data.id !== targetReference)
    const flowNode = this.flowNodes.find(node => node.id === targetReference)
    if (flowNode) {
      if (filterFlowDatas.length > 0) this.setFlowData(filterFlowDatas, flowData);
    } else if (flowData?.flowType === FlowMetaType.LOOP && flowData?.nextValueConnector?.targetReference) {
      this.initFlowNodes(flowData.flowType, flowData)
      this.setFlowData(flowDatas, flowData);
    } else {
      this.initFlowNodes(flowData.flowType, flowData)
      if (filterFlowDatas.length > 0) this.setFlowData(filterFlowDatas, flowData);
    }
  }

  initFlowNodes(metaType: FlowMetaType, flowData: FlowMetaParam, flowNode?: NodeProps, decisionEndId?: string) {
    const loopBack = this.loopBackNode(flowData, flowNode);
    console.log(loopBack)
    let loopLastData = undefined
    if (!flowNode) {
      loopLastData = this.flowNodes.find((data: any) => {
        if (flowData?.connector) {
          return flowData?.connector?.targetReference === data.id
        } else if (flowData?.nextValueConnector) {
          return flowData?.defaultConnector?.targetReference === data.id
        }
      })
    }
    console.log(loopLastData, flowData, 'loopLastData')
    switch (metaType) {
      case FlowMetaType.START:
        this.setStarts(flowData)
        break;
      case FlowMetaType.ASSIGNMENT:
        this.setBaseInfos(flowData, metaType, loopBack, loopLastData, decisionEndId)
        break;
      case FlowMetaType.DECISION:
      case FlowMetaType.SUSPEND:
        this.setDecisions(flowData, loopBack, loopLastData, decisionEndId)
        break;
      case FlowMetaType.LOOP:
        this.setLoops(flowData, loopBack, loopLastData, decisionEndId)
        break;
      case FlowMetaType.SORT_COLLECTION_PROCESSOR:
        this.setBaseInfos(flowData, metaType, loopBack, loopLastData, decisionEndId)
        break;
      case FlowMetaType.RECORD_CREATE:
      case FlowMetaType.RECORD_DELETE:
      case FlowMetaType.RECORD_LOOKUP:
      case FlowMetaType.RECORD_UPDATE:
        this.setBaseInfos(flowData, metaType, loopBack, loopLastData, decisionEndId)
        break;
      default:
        break;
    }
  }

  setStarts(flowData: FlowMetaParam) {
    const id = uid()
    this.flowNodes.push({
      id: flowData.id,
      type: 'begin',
      width: STAND_SIZE,
      height: STAND_SIZE,
      targets: [id],
      component: 'StartNode',
    }, {
      id,
      type: 'forward',
      width: STAND_SIZE,
      height: STAND_SIZE,
      targets: [flowData?.connector?.targetReference || this.flowEndId],
      component: 'ExtendNode',
    })
  }

  setDecisions(flowData: FlowMetaParam, loopBackNode: NodeProps | undefined, loopLastData?: NodeProps, decisionEndId?: string) {
    const endId = uid()
    const decisionEndTarget = [loopBackNode?.id ? loopBackNode.id :
      (loopLastData?.loopBackTarget ? loopLastData.loopBackTarget : (flowData?.defaultConnector?.targetReference || endId))]
    const decisions: NodeProps[] = [{
      id: flowData.id,
      type: 'decisionBegin',
      decisionEndTarget: loopBackNode?.id ? loopBackNode.id :
        (loopLastData?.loopBackTarget ? loopLastData.loopBackTarget : endId),
      width: STAND_SIZE,
      height: STAND_SIZE,
      targets: [],
      label: flowData.id,
      component: 'DecisionNode',
      onClick: () => console.log('this is', flowData.id)
    }]
    const ids: string[] = []
    flowData.rules?.forEach((rule) => {
      ids.push(rule.id)
      decisions.push({
        id: rule.id,
        type: 'forward',
        width: STAND_SIZE,
        height: STAND_SIZE,
        targets: [loopBackNode ? loopBackNode.id :
          (loopLastData?.loopBackTarget ? loopLastData.loopBackTarget : (rule?.connector?.targetReference as string || endId))],
        component: 'ExtendNode',
      })
      if (rule?.connector) {
        const metaFlow = this.metaFlowDatas.find((meta) => meta.id === rule?.connector?.targetReference)
        if (metaFlow) this.initFlowNodes(metaFlow.flowType, metaFlow, undefined, decisionEndId || endId)
      }
    })
    const id = uid()
    ids.push(id)
    decisions.push(
      {
        id,
        type: 'forward',
        width: STAND_SIZE,
        height: STAND_SIZE,
        targets: decisionEndTarget,
        component: 'ExtendNode',
      }
    )
    if (flowData?.defaultConnector) {
      const metaFlow = this.metaFlowDatas.find((meta) => meta.id === flowData?.defaultConnector?.targetReference)
      if (metaFlow) this.initFlowNodes(metaFlow.flowType, metaFlow, undefined, decisionEndId || endId)
    }
    if (!loopBackNode && !loopLastData) {
      decisions.push({
        id: endId,
        type: 'decisionEnd',
        width: STAND_SIZE,
        height: STAND_SIZE,
        targets: [flowData?.connector?.targetReference || decisionEndId || this.flowEndId],
        component: 'ExtendNode',
      })
    }
    decisions[0].targets = ids
    this.flowNodes.push(...decisions)
    console.log(this.flowNodes, '111111111222222')
  }

  setLoops(flowData: FlowMetaParam, loopBackNode: NodeProps | undefined, loopLastData?: NodeProps, decisionEndId?: string) {
    const backId = uid()
    const endId = uid()
    const id = uid()
    const loopEndTarget = [loopBackNode?.id ? loopBackNode.id :
      (loopLastData?.loopBackTarget ? loopLastData.loopBackTarget : endId)]
    const loops: NodeProps[] = [{
      id: flowData.id,
      type: 'loopBegin',
      loopBackTarget: backId,
      loopEndTarget: loopEndTarget.join(''),
      width: STAND_SIZE,
      height: STAND_SIZE,
      targets: [flowData?.nextValueConnector?.targetReference ? id : backId],
      component: 'LoopNode',
    }]
    if (flowData?.nextValueConnector?.targetReference) {
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
    loops.push({
      id: backId,
      type: 'loopBack',
      width: STAND_SIZE,
      height: STAND_SIZE,
      targets: loopEndTarget,
      component: 'ExtendNode',
    })
    if (!loopBackNode && !loopLastData) {
      loops.push({
        id: endId,
        type: 'loopEnd',
        width: STAND_SIZE,
        height: STAND_SIZE,
        targets: [flowData?.defaultConnector?.targetReference || decisionEndId || this.flowEndId],
        component: 'ExtendNode',
      })
      if (flowData?.defaultConnector && decisionEndId) {
        const metaFlow = this.metaFlowDatas.find((meta) => meta.id === flowData?.defaultConnector?.targetReference)
        if (metaFlow) this.initFlowNodes(metaFlow.flowType, metaFlow, undefined, decisionEndId)
      }
    }
    this.flowNodes.push(...loops)
  }

  setBaseInfos(targetNode: FlowMetaParam, metaType: FlowMetaType, loopBackNode: NodeProps | undefined, loopLastData?: NodeProps, decisionEndId?: string) {
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
    const recordCreates: NodeProps[] = [{
      id: targetNode.id,
      type: 'forward',
      width: STAND_SIZE,
      height: STAND_SIZE,
      targets: [loopBackNode ? loopBackNode.id :
        (loopLastData?.loopBackTarget ? loopLastData.loopBackTarget : id)],
      component: componentName
    }]
    if (!loopBackNode && !loopLastData) {
      recordCreates.push({
        id: id,
        type: 'forward',
        width: STAND_SIZE,
        height: STAND_SIZE,
        targets: [targetNode?.connector?.targetReference || decisionEndId || this.flowEndId],
        component: 'ExtendNode',
      })
      if (targetNode?.connector && decisionEndId) {
        const metaFlow = this.metaFlowDatas.find((meta) => meta.id === targetNode?.connector?.targetReference)
        if (metaFlow) this.initFlowNodes(metaFlow.flowType, metaFlow, undefined, decisionEndId)
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
          node.loopEndTarget = id
        } else if (node.decisionEndTarget === flowNode?.id) {
          type = 'decisionEnd'
          node.decisionEndTarget = id
        }
      })
      const extendNode: NodeProps = {
        id,
        type,
        width: STAND_SIZE,
        height: STAND_SIZE,
        targets: [targetNode.id],
        component: 'ExtendNode',
      }
      this.flowNodes.push(extendNode);
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