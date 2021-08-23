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
  label?: string;
  targets: string[];
  forkEndTarget?: string;
  cycleBackTarget?: string;
  cycleEndTarget?: string;
  component?: string;
}

export class FlowGraph {
  id: string
  disposers: (() => void)[] = []
  initialMeta: FlowGraphMeta
  flowNodes: any[] = []
  metaFlowDatas: any[] = []
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
    console.log(nodeId, 'nodeId');
    data.connector = {
      targetReference: flowNode?.targets[0]
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
          targetReference: flowNode?.targets[0],
        }
        data.defaultConnector = {
          targetReference: flowNode?.targets[0],
        }
      } 
      const arr = isArr(flow[metaType]) ? flow[metaType] : []
      arr.push(data)
      flow[metaType] = arr
    }
    console.log(data, flowNode, 'this.initialMeta.flow')
    this.initFlowNodes(metaType, data, flowNode)
  }

  onInit = () => {
    this.metaFlowDatas = []
    const flowData = this.initialMeta.flow as any
    for (const key in flowData) {
      if (flowData.hasOwnProperty(key)) {
        const metaType = showMetaTypes.find(type => type === key)
        if (metaType) {
          this.metaFlowDatas.push({
            ...flowData[key],
            flowType: metaType
          })
          if (isArr(flowData[key])) {
            flowData[key].forEach((data: FlowMetaParam) => {
              this.initFlowNodes(metaType, data)
            })
          } else {
            this.initFlowNodes(metaType, flowData[key])
          }
        }
      }
    }
    this.flowNodes.push({
      id: this.flowEndId,
      type: 'end',
      width: STAND_SIZE,
      height: STAND_SIZE,
      component: 'EndNode',
    })
  }

  initFlowNodes(metaType: FlowMetaTypes, flowData: FlowMetaParam, flowNode?: NodeProps) {
    const cycleBack = this.cycleBackNode(flowData, flowNode);
    console.log(cycleBack)
    switch (metaType) {
      case FlowMetaTypes.START:
        this.setStarts(flowData)
        break;
      case FlowMetaTypes.ASSIGNMENTS:
        this.setBaseInfos(flowData, metaType, cycleBack)
        break;
      case FlowMetaTypes.DECISIONS:
        this.setDecisions(flowData, cycleBack)
        break;
      case FlowMetaTypes.LOOPS:
        this.setLoops(flowData, cycleBack)
        break;
      case FlowMetaTypes.SORT_COLLECTION_PROCESSOR:
        this.setBaseInfos(flowData, metaType, cycleBack)
        break;
      case FlowMetaTypes.RECORD_CREATES:
      case FlowMetaTypes.RECORD_DELETES:
      case FlowMetaTypes.RECORD_LOOKUPS:
      case FlowMetaTypes.RECORD_UPDATES:
        this.setBaseInfos(flowData, metaType, cycleBack)
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

  setDecisions(flowData: FlowMetaParam, cycleBackNode: NodeProps | undefined) {
    const endId = flowData.defaultConnector?.targetReference as string
    const decisions: NodeProps[] = [{
      id: flowData.id,
      type: 'forkBegin',
      forkEndTarget: cycleBackNode ? cycleBackNode.id : endId,
      width: STAND_SIZE,
      height: STAND_SIZE,
      targets: [],
      label: flowData.id,
      component: 'DecisionNode'
    }]
    const ids: string[] = []
    flowData.rules?.forEach((rule) => {
      ids.push(rule.id)
      decisions.push({
        id: rule.id,
        type: 'forward',
        width: STAND_SIZE,
        height: STAND_SIZE,
        targets: [cycleBackNode ? cycleBackNode.id : rule?.connector?.targetReference as string],
        component: 'ExtendNode',
      })
    })
    const id = uid()
    ids.push(id)
    decisions.push(
      {
        id,
        type: 'forward',
        width: STAND_SIZE,
        height: STAND_SIZE,
        targets: [cycleBackNode ? cycleBackNode.id : endId],
        component: 'ExtendNode',
      }
    )
    if (!cycleBackNode) {
      decisions.push({
        id: endId,
        type: 'forkEnd',
        width: STAND_SIZE,
        height: STAND_SIZE,
        targets: [flowData?.connector?.targetReference || this.flowEndId],
        component: 'ExtendNode',
      })
    }
    decisions[0].targets = ids
    this.flowNodes.push(...decisions)
    console.log(this.flowNodes, '111111111222222')
  }

  setLoops(flowData: FlowMetaParam, cycleBackNode: NodeProps | undefined) {
    const backId = uid()
    const endId = uid()
    const loops = [{
      id: flowData.id,
      type: 'cycleBegin',
      cycleBackTarget: backId,
      cycleEndTarget: cycleBackNode ? cycleBackNode.id : endId,
      width: STAND_SIZE,
      height: STAND_SIZE,
      targets: [backId],
    }, {
      id: backId,
      type: 'cycleBack',
      width: STAND_SIZE,
      height: STAND_SIZE,
      targets: [cycleBackNode ? cycleBackNode.id : endId],
      component: 'ExtendNode',
    }]
    if (!cycleBackNode) {
      loops.push({
        id: endId,
        type: 'cycleEnd',
        width: STAND_SIZE,
        height: STAND_SIZE,
        targets: [flowData?.defaultConnector?.targetReference || this.flowEndId],
        component: 'ExtendNode',
      })
    }
    this.flowNodes.push(...loops)
  }

  setBaseInfos(targetNode: FlowMetaParam, metaType: FlowMetaTypes, cycleBackNode: NodeProps | undefined) {
    const id = uid()
    const recordCreates: NodeProps[] = [{
      id: targetNode.id,
      type: 'forward',
      width: STAND_SIZE,
      height: STAND_SIZE,
      targets: [cycleBackNode ? cycleBackNode.id : id],
    }]
    if (!cycleBackNode) {
      recordCreates.push({
        id: id,
        type: 'forward',
        width: STAND_SIZE,
        height: STAND_SIZE,
        targets: [targetNode?.connector?.targetReference || this.flowEndId],
        component: 'ExtendNode',
      })
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