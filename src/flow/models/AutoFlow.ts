import {
  define,
  observable,
  batch,
} from '@formily/reactive'
import { Flow, FlowNodeType } from '@toy-box/flow-graph';
import { IFieldMeta, IFieldGroupMeta } from '@toy-box/meta-schema';
import { isArr } from '@formily/shared';
import { isNum } from '@toy-box/toybox-shared';
import { FlowGraphMeta, FlowMetaType, FlowMetaParam, IFlowResourceType, FlowMeta } from '../types'
import { uid } from '../../utils';
import { FlowStart, FlowAssignment, FlowDecisions, FlowLoops,
  FlowSortCollectionProcessor, FlowSuspends, RecordCreates,
  RecordUpdates, RecordDeletes, RecordLookups, Constants, Formulas, Templates, Variables } from './index'
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
  FlowMetaType.ASSIGNMENTS,
  FlowMetaType.DECISIONS,
  FlowMetaType.SUSPENDS,
  FlowMetaType.LOOPS,
  FlowMetaType.SORT_COLLECTION_PROCESSOR,
  FlowMetaType.RECORD_CREATES,
  FlowMetaType.RECORD_DELETES,
  FlowMetaType.RECORD_LOOKUPS,
  FlowMetaType.RECORD_UPDATES,
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
  flowStart: FlowStart
  flowAssignments: FlowAssignment[] = []
  flowDecisions: FlowDecisions
  flowLoops: FlowLoops
  flowSortCollections: FlowSortCollectionProcessor
  flowSuspends: FlowSuspends
  recordCreates: RecordCreates
  recordUpdates: RecordUpdates
  recordDeletes: RecordDeletes
  recordLookups: RecordLookups
  fieldMetas: IFieldGroupMeta[]
  flowConstants: Constants
  flowFormulas: Formulas
  flowTemplates: Templates
  flowVariables: Variables

  constructor(autoFlowMeta: FlowGraphMeta) {
    this.id = autoFlowMeta.id
    this.initialMeta = autoFlowMeta
    this.flowStart = new FlowStart()
    // this.flowAssignment = new FlowAssignment()
    this.flowDecisions = new FlowDecisions()
    this.flowLoops = new FlowLoops()
    this.flowSortCollections = new FlowSortCollectionProcessor()
    this.flowSuspends = new FlowSuspends()
    this.recordCreates = new RecordCreates()
    this.recordUpdates = new RecordUpdates()
    this.recordDeletes = new RecordDeletes()
    this.recordLookups = new RecordLookups()
    this.flowConstants = new Constants()
    this.flowFormulas = new Formulas()
    this.flowTemplates = new Templates()
    this.flowVariables = new Variables()
    this.fieldMetas = [
      {
        label: '变量',
        value: IFlowResourceType.VARIABLE,
        children: this.flowVariables.variableNotArray,
      },
      {
        label: '集合变量',
        value: IFlowResourceType.VARIABLE_ARRAY,
        children: this.flowVariables.variableArray,
      },
      {
        label: '集合记录变量',
        value: IFlowResourceType.VARIABLE_ARRAY_RECORD,
        children: this.flowVariables.variableArrayRecord,
      },
      {
        label: '常量',
        value: IFlowResourceType.CONSTANT,
        children: this.flowConstants.constants,
      },
      {
        label: '公式',
        value: IFlowResourceType.FORMULA,
        children: this.flowFormulas.formulas,
      },
      {
        label: '模板',
        value: IFlowResourceType.TEMPLATE,
        children: this.flowTemplates.templates,
      }
    ]
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
      flowDecisions: observable.deep,
      flowSuspends: observable.deep,
      flowLoops: observable.deep,
      flowSortCollections: observable.deep,
      recordCreates: observable.deep,
      recordDeletes: observable.deep,
      recordLookups: observable.deep,
      recordUpdates: observable.deep,
      flowConstants: observable.deep,
      flowVariables: observable.deep,
      flowFormulas: observable.deep,
      flowTemplates: observable.deep,
      fieldMetas: observable.deep,
      // onInit: batch,
    })
  }

  setId = (id: string) => {
    this.id = id
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
      if (metaType === FlowMetaType.LOOPS) {
        data.connector = undefined
        data.nextValueConnector = {
          targetReference: null,
        }
        data.defaultConnector = {
          targetReference: cycleBeginNode ? cycleBeginNode.id : (flowNode?.targets?.[0] || null),
        }
      }
    }
    this.initFlowNodes(metaType, data, flowNode)
  }

  updataFlowMetaData = (flowNode: NodeProps | undefined, metaType: FlowMetaType, flowData: FlowMetaParam, currentUpdataData?: FlowMetaParam) => {
    const flow = this.mataFlowJson.flow as any
    const data = { ...flowData }
    if (metaType === FlowMetaType.LOOPS) {
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
          this.initMetaFields(metaType, currentFlow, MetaFieldType.EDIT)
        }
        return meta
      } else if ((baseNode?.id === meta.id && !cycleBeginOfBackNode)) {
        if (meta.flowType === FlowMetaType.LOOPS) {
          if (metaType === FlowMetaType.LOOPS && data?.defaultConnector) {
            data.defaultConnector.targetReference = meta?.id || (meta?.connector?.targetReference || null)
          } else if (data.connector) {
            data.connector.targetReference = meta?.nextValueConnector?.targetReference || (meta?.connector?.targetReference || null)
          }
          if (flowIdx > -1) {
            const currentFlow = {
              ...flow[meta.flowType][flowIdx]
            }
            currentFlow.nextValueConnector.targetReference = data.id
            this.initMetaFields(metaType, currentFlow, MetaFieldType.EDIT)
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
            this.initMetaFields(metaType, currentFlow, MetaFieldType.EDIT)
          }
        }
        return meta
      } else if (forkBeginOfForwardNode?.id === meta.id) {
        const idx = meta?.rules?.findIndex((rule) => rule.id === flowNode?.id)
        if (isNum(idx) && idx > -1 && flowIdx > -1) {
          if (metaType === FlowMetaType.LOOPS && data?.defaultConnector) {
            data.defaultConnector.targetReference = meta?.rules?.[idx]?.connector?.targetReference || null
          } else if (data.connector) {
            data.connector.targetReference = meta?.rules?.[idx]?.connector?.targetReference || null
          }
          this.initMetaFields(metaType, data, MetaFieldType.ADD)
          const currentFlow = {
            ...flow[meta.flowType][flowIdx]
          }
          currentFlow.rules[idx].connector.targetReference = data.id
          this.initMetaFields(metaType, currentFlow, MetaFieldType.EDIT)
        } else if (flowIdx > -1) {
          if (metaType === FlowMetaType.LOOPS && data?.defaultConnector) {
            data.defaultConnector.targetReference = flow[meta.flowType][flowIdx]?.defaultConnector?.targetReference || null
          } else if (data.connector) {
            data.connector.targetReference = flow[meta.flowType][flowIdx]?.defaultConnector?.targetReference || null
          }
          this.initMetaFields(metaType, data, MetaFieldType.ADD)
          const currentFlow = {
            ...flow[meta.flowType][flowIdx]
          }
          currentFlow.defaultConnector.targetReference = data.id
          this.initMetaFields(metaType, currentFlow, MetaFieldType.EDIT)
        }
        return meta
      } else if (cycleBeginOfBackNode?.id === meta.id) {
        if (meta?.nextValueConnector?.targetReference === null && flowIdx > -1) {
          this.updataCurrentFlowData(meta, data, metaType)
          const currentFlow = {
            ...flow[meta.flowType][flowIdx]
          }
          currentFlow.nextValueConnector.targetReference = data.id
          this.initMetaFields(metaType, currentFlow, MetaFieldType.EDIT)
        } else {
          this.updataCurrentFlowData(meta, data, metaType)
          const node = this.flowNodes.find((nd) => nd?.targets?.[0] === flowNode?.id)
          const mTData = this.metaFlowDatas.find((mt) => mt.id === node?.id)
          const mtIdx = mTData?.flowType && flow[mTData?.flowType].findIndex((flowMeta: FlowMetaParam) => flowMeta.id === mTData?.id)
          if (mTData && mtIdx && mTData.flowType === FlowMetaType.LOOPS) {
            const currentFlow = {
              ...flow[mTData.flowType][mtIdx]
            }
            currentFlow.defaultConnector.targetReference = data.id
            this.initMetaFields(metaType, currentFlow, MetaFieldType.EDIT)
            // flow[mTData.flowType][mtIdx].defaultConnector.targetReference = data.id
          } else if (mTData && mtIdx) {
            const currentFlow = {
              ...flow[mTData.flowType][mtIdx]
            }
            currentFlow.connector.targetReference = data.id
            this.initMetaFields(metaType, currentFlow, MetaFieldType.EDIT)
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
        this.initMetaFields(metaType, currentFlow, MetaFieldType.EDIT)
        return meta
      }
    })
  }

  updataCurrentFlowData = (meta: FlowMetaParamOfType, data: FlowMetaParam, metaType: FlowMetaType, ) => {
    // const flow = this.initialMeta.flow as any
    if (meta.flowType !== FlowMetaType.LOOPS) {
      if (metaType === FlowMetaType.LOOPS && data?.defaultConnector) {
        data.defaultConnector.targetReference = meta?.connector?.targetReference || null
      } else if (data.connector) {
        data.connector.targetReference = meta?.connector?.targetReference || null
      }
    } else {
      if (metaType === FlowMetaType.LOOPS && data?.defaultConnector) {
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

  initMetaFields = (metaType: string, flowData: FlowMetaParam | any, metaFieldType?: MetaFieldType) => {
    const data = { ...flowData }
    switch (metaType) {
      case FlowMetaType.START:
        if (metaFieldType === MetaFieldType.EDIT) {
          this.flowStart.onEdit(data)
        } else {
          this.flowStart.initData(data[metaType])
          this.mataFlowJson.flow[FlowMetaType.START] = this.flowStart.start
        }
        break;
      case FlowMetaType.ASSIGNMENTS:
        if (metaFieldType === MetaFieldType.ADD) {
          this.flowAssignments.push(new FlowAssignment(data))
        } else if (metaFieldType === MetaFieldType.EDIT) {
          this.flowAssignments.forEach((assignment) => {
            if (assignment.id === data.id) assignment.onEdit(data)
          })
        } else {
          data[metaType].forEach((assignment: FlowAssignment) => {
            this.flowAssignments.push(new FlowAssignment(assignment))
          });
          this.mataFlowJson.flow[FlowMetaType.ASSIGNMENTS] = this.flowAssignments
        }
        break;
      case FlowMetaType.DECISIONS:
        if (metaFieldType === MetaFieldType.ADD) {
          this.flowDecisions.onAdd(data)
        } else if (metaFieldType === MetaFieldType.EDIT) {
          this.flowDecisions.onEdit(data)
        } else {
          this.flowDecisions.initDatas(data[metaType])
          this.mataFlowJson.flow[FlowMetaType.DECISIONS] = this.flowDecisions.decisions
        }
        break;
      case FlowMetaType.SUSPENDS:
        if (metaFieldType === MetaFieldType.ADD) {
          this.flowSuspends.onAdd(data)
        } else if (metaFieldType === MetaFieldType.EDIT) {
          this.flowSuspends.onEdit(data)
        } else {
          this.flowSuspends.initDatas(data[metaType])
          this.mataFlowJson.flow[FlowMetaType.SUSPENDS] = this.flowSuspends.suspends
        }
        break;
      case FlowMetaType.LOOPS:
        if (metaFieldType === MetaFieldType.ADD) {
          this.flowLoops.onAdd(data)
        } else if (metaFieldType === MetaFieldType.EDIT) {
          this.flowLoops.onEdit(data)
        } else {
          this.flowLoops.initDatas(data[metaType])
          this.mataFlowJson.flow[FlowMetaType.LOOPS] = this.flowLoops.loops
        }
        break;
      case FlowMetaType.SORT_COLLECTION_PROCESSOR:
        if (metaFieldType === MetaFieldType.ADD) {
          this.flowSortCollections.onAdd(data)
        } else if (metaFieldType === MetaFieldType.EDIT) {
          this.flowSortCollections.onEdit(data)
        } else {
          this.flowSortCollections.initDatas(data[metaType])
          this.mataFlowJson.flow[FlowMetaType.SORT_COLLECTION_PROCESSOR] = this.flowSortCollections.sortCollectionProcessor
        }
        break;
      case FlowMetaType.RECORD_CREATES:
        if (metaFieldType === MetaFieldType.ADD) {
          this.recordCreates.onAdd(data)
        } else if (metaFieldType === MetaFieldType.EDIT) {
          this.recordCreates.onEdit(data)
        } else {
          this.recordCreates.initDatas(data[metaType])
          this.mataFlowJson.flow[FlowMetaType.RECORD_CREATES] = this.recordCreates.recordCreates
        }
        break;
      case FlowMetaType.RECORD_DELETES:
        if (metaFieldType === MetaFieldType.ADD) {
          this.recordDeletes.onAdd(data)
        } else if (metaFieldType === MetaFieldType.EDIT) {
          this.recordDeletes.onEdit(data)
        } else {
          this.recordDeletes.initDatas(data[metaType])
          this.mataFlowJson.flow[FlowMetaType.RECORD_DELETES] = this.recordDeletes.recordDeletes
        }
        break;
      case FlowMetaType.RECORD_LOOKUPS:
        if (metaFieldType === MetaFieldType.ADD) {
          this.recordLookups.onAdd(data)
        } else if (metaFieldType === MetaFieldType.EDIT) {
          this.recordLookups.onEdit(data)
        } else {
          this.recordLookups.initDatas(data[metaType])
          this.mataFlowJson.flow[FlowMetaType.RECORD_LOOKUPS] = this.recordLookups.recordLookups
        }
        break;
      case FlowMetaType.RECORD_UPDATES:
        if (metaFieldType === MetaFieldType.ADD) {
          this.recordUpdates.onAdd(data)
        } else if (metaFieldType === MetaFieldType.EDIT) {
          this.recordUpdates.onEdit(data)
        } else {
          this.recordUpdates.initDatas(data[metaType])
          this.mataFlowJson.flow[FlowMetaType.RECORD_UPDATES] = this.recordUpdates.recordUpdates
        }
        break;
      case IFlowResourceType.VARIABLE:
        this.flowVariables.initDatas(data[metaType])
        this.mataFlowJson.flow[IFlowResourceType.VARIABLE] = this.flowVariables.variables
        break;
      case IFlowResourceType.CONSTANT:
        this.flowConstants.initDatas(data[metaType])
        this.mataFlowJson.flow[IFlowResourceType.CONSTANT] = this.flowConstants.constants
        break;
      case IFlowResourceType.FORMULA:
        this.flowFormulas.initDatas(data[metaType])
        this.mataFlowJson.flow[IFlowResourceType.FORMULA] = this.flowFormulas.formulas
        break;
      case IFlowResourceType.TEMPLATE:
        this.flowTemplates.initDatas(data[metaType])
        this.mataFlowJson.flow[IFlowResourceType.TEMPLATE] = this.flowTemplates.templates
        break;
      default:
        break;
    }
    console.log(this.flowAssignments, this.mataFlowJson)
  }

  // 按targets顺序进行flowNodes实例化
  setFlowData = (flowDatas: any[], target?: FlowMetaParamOfType) => {
    if (!target) {
      flowDatas.some((flowData, index) => {
        if (flowData.flowType === FlowMetaType.START) {
          this.initFlowNodes(flowData.flowType, flowData)
          flowDatas.splice(index, 1)
          return this.setFlowData(flowDatas, flowData);
        } 
      })
    } else {
      const targetReference = target?.flowType === FlowMetaType.LOOPS ?
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
    } else if (flowData?.flowType === FlowMetaType.LOOPS && flowData?.nextValueConnector?.targetReference) {
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
      case FlowMetaType.ASSIGNMENTS:
        this.setBaseInfos(flowData, metaType, loopBack, loopLastData, decisionEndId)
        break;
      case FlowMetaType.DECISIONS:
      case FlowMetaType.SUSPENDS:
        this.setDecisions(flowData, loopBack, loopLastData, decisionEndId)
        break;
      case FlowMetaType.LOOPS:
        this.setLoops(flowData, loopBack, loopLastData, decisionEndId)
        break;
      case FlowMetaType.SORT_COLLECTION_PROCESSOR:
        this.setBaseInfos(flowData, metaType, loopBack, loopLastData, decisionEndId)
        break;
      case FlowMetaType.RECORD_CREATES:
      case FlowMetaType.RECORD_DELETES:
      case FlowMetaType.RECORD_LOOKUPS:
      case FlowMetaType.RECORD_UPDATES:
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
    const recordCreates: NodeProps[] = [{
      id: targetNode.id,
      type: 'forward',
      width: STAND_SIZE,
      height: STAND_SIZE,
      targets: [loopBackNode ? loopBackNode.id :
        (loopLastData?.loopBackTarget ? loopLastData.loopBackTarget : id)],
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