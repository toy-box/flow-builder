import React, { FC, useCallback, useMemo } from 'react';
import { useNode } from '@toy-box/flow-nodes';
import { AutoFlow } from '../../../flow/models/AutoFlow'
import { FlowMetaType, FlowMetaParam } from '../../../flow/types'
import { usePrefix } from '../../../hooks'
import '../styles/labelPanel.less'

interface LabelNodePanelProps {
  flowGraph: AutoFlow,
  flowNodeType?: FlowMetaType
}

export const LabelNodePanel: FC<LabelNodePanelProps> = ({ flowGraph, flowNodeType }) => {
  const node: any = useNode();
  const prefixCls = usePrefix('-label-node-panel-name')
  const positionFlag = useMemo(() => {
    if (flowNodeType === FlowMetaType.DECISION || flowNodeType === FlowMetaType.LOOP
      || flowNodeType === FlowMetaType.WAIT) return true
    return false
  }, [])
  const style: React.CSSProperties = {
  };
  const nodeName = useMemo(() => {
    const flow = flowGraph.mataFlowJson.flow as any
    const flowNodes = flowGraph.flowNodes
    const flowNode = flowNodes.find((flowNode) => {
      return (flowNode?.targets || []).includes(node.node.id)
    })
    if (flowNode?.type === 'decisionBegin') {
      const flowDecision = (flow[FlowMetaType.DECISION] || []).find((meta: FlowMetaParam) => meta.id === flowNode?.id)
      const flowWait = (flow[FlowMetaType.WAIT] || []).find((meta: FlowMetaParam) => meta.id === flowNode?.id)
      if (flowDecision) {
        const rule = flowDecision.rules.find((meta: FlowMetaParam) => meta.id === node.node.id)
        if (rule) return rule?.name
        return flowDecision.defaultConnectorName
      } else if (flowWait) {
        const rule = flowWait?.waitEvents.find((meta: FlowMetaParam) => meta.id === node.node.id)
        if (rule) return rule?.name
        return flowWait.defaultConnectorName
      }
    } else if (flowNode?.type === 'loopBegin') {
      return 'For Each'
    } else if (flowNode?.type === 'loopBack') {
      return 'After Last'
    }
  }, [flowGraph.mataFlowJson])
  return (
    <div style={style}>
      <div title={nodeName} className={prefixCls}>{nodeName}</div>
    </div>
  );
};
