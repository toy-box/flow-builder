import { Graph } from '@antv/x6'
import {
  define,
  observable,
  batch,
  observe,
} from '@formily/reactive'
import { Flow } from '@toy-box/flow-graph';
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

export type FlowNodeType =
  | 'begin'
  | 'end'
  | 'forkBegin'
  | 'forkEnd'
  | 'cycleBegin'
  | 'cycleBack'
  | 'cycleEnd'
  | 'forward';

export interface NodeProps {
  id: string;
  width: number;
  height: number;
  type: FlowNodeType;
  targets: string[];
  forkEndTarget?: string;
  cycleBackTarget?: string;
  cycleEndTarget?: string;
  component?: string;
}

export interface FlowMetaParamOfType extends FlowMetaParam {
  flowType: FlowMetaTypes
}

export class FlowGraph {
  id: string
  disposers: (() => void)[] = []
  initialMeta: FlowGraphMeta
  flowNodes: any[] = []
  metaFlowDatas: FlowMetaParamOfType[] = []
  useFlow: any
  flowEndId: string

  constructor(flowGraphMeta: FlowGraphMeta) {
    this.id = flowGraphMeta.id
    this.initialMeta = flowGraphMeta
    this.useFlow = new Flow()
    this.flowEndId = uid()
    this.makeObservable()
    this.onInit()
  }

  protected makeObservable() {
    define(this, {
      setId: batch,
      useFlow: observable.deep,
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
    const flow = this.initialMeta.flow as any
    const data = flowData
    const flowNode: any = this.flowNodes.find((node) => node.id === nodeId)
    this.updataFlowMetaData(flowNode, metaType, flowData)
    let cycleBeginNode = null
    if (flowNode.type === 'cycleBack') {
      cycleBeginNode = this.flowNodes.find((node) => node.cycleBackTarget === nodeId)
    }
    data.connector = {
      targetReference: cycleBeginNode ? cycleBeginNode.id : flowNode?.targets[0]
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
          targetReference: cycleBeginNode ? cycleBeginNode.id : flowNode?.targets[0],
        }
      }
      // else {
      //   for (const key in flow) {
      //     if (flow.hasOwnProperty(key)) {
      //       if (isArr(flow[key])) {
      //         flow[key].forEach((meta: FlowMetaParam) => {
      //           if (meta.connector && meta.connector.targetReference === flowNode?.targets[0]) {
      //             meta.connector.targetReference = data.id
      //           } else if (key === FlowMetaTypes.LOOPS) {
      //             if (flowNode.type === 'cycleBack') {
      //               const backBool = this.loopNode(nodeId, 'cycleBackTarget')
      //               if (backBool && meta.nextValueConnector) meta.nextValueConnector.targetReference = data.id
      //             } else if (flowNode.type === 'cycleEnd') {
      //               const endBool = this.loopNode(nodeId, 'cycleEndTarget')
      //               if (endBool && meta.defaultConnector) meta.defaultConnector.targetReference = data.id
      //             }
      //           }
      //         })
      //       } else if (flow[key].connector.targetReference === flowNode?.targets[0]) {
      //         flow[key].connector.targetReference = data.id
      //       }
      //     }
      //   }
      // }
      // const arr = isArr(flow[metaType]) ? flow[metaType] : []
      // arr.push(data)
      // flow[metaType] = arr
    }
    console.log(data, flow, 'this.initialMeta.flow')
    this.initFlowNodes(metaType, data, flowNode)
  }

  updataFlowMetaData = (flowNode: NodeProps, metaType: FlowMetaTypes, flowData: FlowMetaParam, currentUpdataData?: FlowMetaParam) => {
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
      const forkBeginOfEndNode = this.flowNodes.find((node) => node.forkEndTarget === flowNode.id)
      const forkBeginOfForwardNode = this.flowNodes.find((node) => {
        return node?.targets?.length > 1 && node.targets.includes(flowNode.id)
      })
      const baseNode = this.flowNodes.find((node) => {
        return node?.targets?.length === 1 && node.targets.includes(flowNode.id)
      })
      const cycleBeginOfBackNode = this.flowNodes.find((node) => node.cycleBackTarget === flowNode.id)
      const cycleBeginOfEndNode = this.flowNodes.find((node) => node.cycleEndTarget === flowNode.id)
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
        const idx = meta?.rules?.findIndex((rule) => rule.id === flowNode.id)
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

  loopNode = (id: string, type: 'cycleBackTarget' | 'cycleEndTarget') => {
    console.log(id);
    let flag = false
    this.flowNodes.some((node: NodeProps) => {
      if (node?.[type] === id) {
        return flag = true
      }
    })
    return flag
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
              // this.initFlowNodes(metaType, data)
              this.metaFlowDatas.push({
                ...data,
                flowType: metaType
              })
            })
          } else {
            // this.initFlowNodes(metaType, flowData[key])
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

  initFlowNodes(metaType: FlowMetaTypes, flowData: FlowMetaParam, flowNode?: NodeProps, forkEndId?: string) {
    const cycleBack = this.cycleBackNode(flowData, flowNode);
    console.log(cycleBack)
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
        this.setBaseInfos(flowData, metaType, cycleBack, loopLastData, forkEndId)
        break;
      case FlowMetaTypes.DECISIONS:
        this.setDecisions(flowData, cycleBack, loopLastData, forkEndId)
        break;
      case FlowMetaTypes.LOOPS:
        this.setLoops(flowData, cycleBack, loopLastData, forkEndId)
        break;
      case FlowMetaTypes.SORT_COLLECTION_PROCESSOR:
        this.setBaseInfos(flowData, metaType, cycleBack, loopLastData, forkEndId)
        break;
      case FlowMetaTypes.RECORD_CREATES:
      case FlowMetaTypes.RECORD_DELETES:
      case FlowMetaTypes.RECORD_LOOKUPS:
      case FlowMetaTypes.RECORD_UPDATES:
        this.setBaseInfos(flowData, metaType, cycleBack, loopLastData, forkEndId)
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

  setDecisions(flowData: FlowMetaParam, cycleBackNode: NodeProps | undefined, loopLastData?: NodeProps, forkEndId?: string) {
    const endId = uid()
    const forkEndTarget = [cycleBackNode?.id ? cycleBackNode.id :
      (loopLastData?.cycleBackTarget ? loopLastData.cycleBackTarget : (flowData?.defaultConnector?.targetReference || endId))]
    const decisions: NodeProps[] = [{
      id: flowData.id,
      type: 'forkBegin',
      forkEndTarget: cycleBackNode?.id ? cycleBackNode.id :
        (loopLastData?.cycleBackTarget ? loopLastData.cycleBackTarget : endId),
      width: STAND_SIZE,
      height: STAND_SIZE,
      targets: [],
      component: 'ForkBegin'
    }]
    const ids: string[] = []
    flowData.rules?.forEach((rule) => {
      ids.push(rule.id)
      decisions.push({
        id: rule.id,
        type: 'forward',
        width: STAND_SIZE,
        height: STAND_SIZE,
        targets: [cycleBackNode ? cycleBackNode.id :
          (loopLastData?.cycleBackTarget ? loopLastData.cycleBackTarget : (rule?.connector?.targetReference as string || endId))],
        component: 'ExtendNode',
      })
      if (rule?.connector) {
        const metaFlow = this.metaFlowDatas.find((meta) => meta.id === rule?.connector?.targetReference)
        if (metaFlow) this.initFlowNodes(metaFlow.flowType, metaFlow, undefined, forkEndId || endId)
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
        targets: forkEndTarget,
        component: 'ExtendNode',
      }
    )
    if (flowData?.defaultConnector) {
      const metaFlow = this.metaFlowDatas.find((meta) => meta.id === flowData?.defaultConnector?.targetReference)
      if (metaFlow) this.initFlowNodes(metaFlow.flowType, metaFlow, undefined, forkEndId || endId)
    }
    if (!cycleBackNode && !loopLastData) {
      decisions.push({
        id: endId,
        type: 'forkEnd',
        width: STAND_SIZE,
        height: STAND_SIZE,
        targets: [flowData?.connector?.targetReference || forkEndId || this.flowEndId],
        component: 'ExtendNode',
      })
    }
    decisions[0].targets = ids
    this.flowNodes.push(...decisions)
    console.log(this.flowNodes, '111111111222222')
  }

  setLoops(flowData: FlowMetaParam, cycleBackNode: NodeProps | undefined, loopLastData?: NodeProps, forkEndId?: string) {
    const backId = uid()
    const endId = uid()
    const id = uid()
    const cycleEndTarget = [cycleBackNode?.id ? cycleBackNode.id :
      (loopLastData?.cycleBackTarget ? loopLastData.cycleBackTarget : endId)]
    const loops: NodeProps[] = [{
      id: flowData.id,
      type: 'cycleBegin',
      cycleBackTarget: backId,
      cycleEndTarget: cycleEndTarget.join(''),
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
      type: 'cycleBack',
      width: STAND_SIZE,
      height: STAND_SIZE,
      targets: cycleEndTarget,
      component: 'ExtendNode',
    })
    if (!cycleBackNode && !loopLastData) {
      loops.push({
        id: endId,
        type: 'cycleEnd',
        width: STAND_SIZE,
        height: STAND_SIZE,
        targets: [flowData?.defaultConnector?.targetReference || forkEndId || this.flowEndId],
        component: 'ExtendNode',
      })
      if (flowData?.defaultConnector && forkEndId) {
        const metaFlow = this.metaFlowDatas.find((meta) => meta.id === flowData?.defaultConnector?.targetReference)
        if (metaFlow) this.initFlowNodes(metaFlow.flowType, metaFlow, undefined, forkEndId)
      }
    }
    this.flowNodes.push(...loops)
  }

  setBaseInfos(targetNode: FlowMetaParam, metaType: FlowMetaTypes, cycleBackNode: NodeProps | undefined, loopLastData?: NodeProps, forkEndId?: string) {
    const id = uid()
    const recordCreates: NodeProps[] = [{
      id: targetNode.id,
      type: 'forward',
      width: STAND_SIZE,
      height: STAND_SIZE,
      targets: [cycleBackNode ? cycleBackNode.id :
        (loopLastData?.cycleBackTarget ? loopLastData.cycleBackTarget : id)],
    }]
    if (!cycleBackNode && !loopLastData) {
      recordCreates.push({
        id: id,
        type: 'forward',
        width: STAND_SIZE,
        height: STAND_SIZE,
        targets: [targetNode?.connector?.targetReference || forkEndId || this.flowEndId],
        component: 'ExtendNode',
      })
      if (targetNode?.connector && forkEndId) {
        const metaFlow = this.metaFlowDatas.find((meta) => meta.id === targetNode?.connector?.targetReference)
        if (metaFlow) this.initFlowNodes(metaFlow.flowType, metaFlow, undefined, forkEndId)
      }
    }
    this.flowNodes.push(...recordCreates)
  }

  cycleBackNode(targetNode: FlowMetaParam, flowNode?: NodeProps) {
    if (flowNode?.type === 'cycleBack') {
      const id = uid()
      let type: string = 'forward'
      this.flowNodes?.forEach((node) => {
        const targets = node.targets
        node?.targets?.forEach((target: string, index: number) => {
          if (target === flowNode?.id) targets.splice(index, 1, id);
        })
        node.targets = targets
        if (node.cycleEndTarget === flowNode?.id) {
          type = 'cycleEnd'
          node.cycleEndTarget = id
        } else if (node.forkEndTarget === flowNode?.id) {
          type = 'forkEnd'
          node.forkEndTarget = id
        }
      })
      const extendNode = {
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