import {
  define,
  observable,
  batch,
} from '@formily/reactive'
import { Flow, FlowNodeType } from '@toy-box/flow-graph';
import { FlowGraphMeta, FlowMetaTypes, FlowMetaParam } from '../types'
import { uid } from '../../utils';
import { isArr } from '@formily/shared';
import { isNum } from '@toy-box/toybox-shared';
// import { runEffects } from '../shared/effectbox'

const showMetaTypes = [
  FlowMetaTypes.START,
  FlowMetaTypes.ASSIGNMENTS,
  FlowMetaTypes.DECISIONS,
  FlowMetaTypes.SUSPENDS,
  FlowMetaTypes.LOOPS,
  FlowMetaTypes.SORT_COLLECTION_PROCESSOR,
  FlowMetaTypes.RECORD_CREATES,
  FlowMetaTypes.RECORD_DELETES,
  FlowMetaTypes.RECORD_LOOKUPS,
  FlowMetaTypes.RECORD_UPDATES
];

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

export interface FlowMetaParamOfType extends FlowMetaParam {
  flowType: FlowMetaTypes
}

export class FlowGraph {
  id: string
  disposers: (() => void)[] = []
  initialMeta: FlowGraphMeta
  flowNodes: NodeProps[] = []
  metaFlowDatas: FlowMetaParamOfType[] = []
  flowGraph: Flow
  flowEndId: string

  constructor(flowGraphMeta: FlowGraphMeta) {
    this.id = flowGraphMeta.id
    this.initialMeta = flowGraphMeta
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
      initialMeta: observable.deep,
      // onInit: batch,
    })
  }

  setId = (id: string) => {
    this.id = id
  }

  updateInitialMeta = (nodeId: string, metaType: FlowMetaTypes, flowData: FlowMetaParam) => {
    console.log('111112323232', nodeId, metaType)
    const flow = this.initialMeta.flow
    const data = flowData
    const flowNode: NodeProps | undefined = this.flowNodes.find((node) => node.id === nodeId)
    this.updataFlowMetaData(flowNode, metaType, flowData)
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
    if (metaType === FlowMetaTypes.START) {
      flow[metaType] = data
    } else {
      if (metaType === FlowMetaTypes.LOOPS) {
        data.connector = undefined
        data.nextValueConnector = {
          targetReference: null,
        }
        data.defaultConnector = {
          targetReference: cycleBeginNode ? cycleBeginNode.id : (flowNode?.targets?.[0] || null),
        }
      }
    }
    console.log(data, flow, 'this.initialMeta.flow')
    this.initFlowNodes(metaType, data, flowNode)
  }

  updataFlowMetaData = (flowNode: NodeProps | undefined, metaType: FlowMetaTypes, flowData: FlowMetaParam, currentUpdataData?: FlowMetaParam) => {
    const flow = this.initialMeta.flow as any
    const data = { ...flowData }
    if (metaType === FlowMetaTypes.LOOPS) {
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
        if (flowIdx > -1) flow[meta.flowType][flowIdx].connector.targetReference = data.id
        return meta
      } else if ((baseNode?.id === meta.id && !cycleBeginOfBackNode)) {
        if (meta.flowType === FlowMetaTypes.LOOPS) {
          if (metaType === FlowMetaTypes.LOOPS && data?.defaultConnector) {
            data.defaultConnector.targetReference = meta?.id || (meta?.connector?.targetReference || null)
          } else if (data.connector) {
            data.connector.targetReference = meta?.nextValueConnector?.targetReference || (meta?.connector?.targetReference || null)
          }
          if (flowIdx > -1) flow[meta.flowType][flowIdx].nextValueConnector.targetReference = data.id
          flow[metaType].push(data)
          this.metaFlowDatas.push({
            ...data,
            flowType: metaType
          });
        } else {
          this.updataCurrentFlowData(meta, data, metaType)
          if (flowIdx > -1) flow[meta.flowType][flowIdx].connector.targetReference = data.id
        }
        return meta
      } else if (forkBeginOfForwardNode?.id === meta.id) {
        const idx = meta?.rules?.findIndex((rule) => rule.id === flowNode?.id)
        this.updataCurrentFlowData(meta, data, metaType)
        if (isNum(idx) && idx > -1 && flowIdx > -1) {
          flow[meta.flowType][flowIdx].rules[idx].connector.targetReference = data.id
        } else if (flowIdx > -1) {
          flow[meta.flowType][flowIdx].defaultConnector.targetReference = data.id
        }
        return meta
      } else if (cycleBeginOfBackNode?.id === meta.id) {
        if (meta?.nextValueConnector?.targetReference === null && flowIdx > -1) {
          this.updataCurrentFlowData(meta, data, metaType)
          flow[meta.flowType][flowIdx].nextValueConnector.targetReference = data.id
        } else {
          this.updataCurrentFlowData(meta, data, metaType)
          const node = this.flowNodes.find((nd) => nd?.targets?.[0] === flowNode?.id)
          const mTData = this.metaFlowDatas.find((mt) => mt.id === node?.id)
          const mtIdx = mTData?.flowType && flow[mTData?.flowType].findIndex((flowMeta: FlowMetaParam) => flowMeta.id === mTData?.id)
          if (mTData && mtIdx && mTData.flowType === FlowMetaTypes.LOOPS) {
            flow[mTData.flowType][mtIdx].defaultConnector.targetReference = data.id
          } else if (mTData && mtIdx) {
            flow[mTData.flowType][mtIdx].connector.targetReference = data.id
          }
        }
        return meta
      } else if (cycleBeginOfEndNode?.id === meta.id) {
        flow[meta.flowType][flowIdx].defaultConnector.targetReference = data.id
        this.updataCurrentFlowData(meta, data, metaType)
        return meta
      }
    })
  }

  updataCurrentFlowData = (meta: FlowMetaParamOfType, data: FlowMetaParam, metaType: FlowMetaTypes, ) => {
    const flow = this.initialMeta.flow as any
    if (meta.flowType !== FlowMetaTypes.LOOPS) {
      if (metaType === FlowMetaTypes.LOOPS && data?.defaultConnector) {
        data.defaultConnector.targetReference = meta?.connector?.targetReference || null
      } else if (data.connector) {
        data.connector.targetReference = meta?.connector?.targetReference || null
      }
    } else {
      if (metaType === FlowMetaTypes.LOOPS && data?.defaultConnector) {
        data.defaultConnector.targetReference = meta?.id || (meta?.connector?.targetReference || null)
      } else if (data.connector) {
        data.connector.targetReference = meta?.id || (meta?.connector?.targetReference || null)
      }
    }
    console.log(metaType, meta, 'meta')
    flow[metaType].push(data)
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
        if (metaType) {
          if (metaType === FlowMetaTypes.START) {
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

  // 按targets顺序进行flowNodes实例化
  setFlowData = (flowDatas: any[], target?: FlowMetaParamOfType) => {
    if (!target) {
      flowDatas.some((flowData, index) => {
        if (flowData.flowType === FlowMetaTypes.START) {
          this.initFlowNodes(flowData.flowType, flowData)
          flowDatas.splice(index, 1)
          return this.setFlowData(flowDatas, flowData);
        } 
      })
    } else {
      const targetReference = target?.flowType === FlowMetaTypes.LOOPS ?
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
    } else if (flowData?.flowType === FlowMetaTypes.LOOPS && flowData?.nextValueConnector?.targetReference) {
      this.initFlowNodes(flowData.flowType, flowData)
      this.setFlowData(flowDatas, flowData);
    } else {
      this.initFlowNodes(flowData.flowType, flowData)
      if (filterFlowDatas.length > 0) this.setFlowData(filterFlowDatas, flowData);
    }
  }

  initFlowNodes(metaType: FlowMetaTypes, flowData: FlowMetaParam, flowNode?: NodeProps, decisionEndId?: string) {
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
      case FlowMetaTypes.START:
        this.setStarts(flowData)
        break;
      case FlowMetaTypes.ASSIGNMENTS:
        this.setBaseInfos(flowData, metaType, loopBack, loopLastData, decisionEndId)
        break;
      case FlowMetaTypes.DECISIONS:
        this.setDecisions(flowData, loopBack, loopLastData, decisionEndId)
        break;
      case FlowMetaTypes.LOOPS:
        this.setLoops(flowData, loopBack, loopLastData, decisionEndId)
        break;
      case FlowMetaTypes.SORT_COLLECTION_PROCESSOR:
        this.setBaseInfos(flowData, metaType, loopBack, loopLastData, decisionEndId)
        break;
      case FlowMetaTypes.RECORD_CREATES:
      case FlowMetaTypes.RECORD_DELETES:
      case FlowMetaTypes.RECORD_LOOKUPS:
      case FlowMetaTypes.RECORD_UPDATES:
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

  setBaseInfos(targetNode: FlowMetaParam, metaType: FlowMetaTypes, loopBackNode: NodeProps | undefined, loopLastData?: NodeProps, decisionEndId?: string) {
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