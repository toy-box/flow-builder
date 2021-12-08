import React, { FC, useCallback, useMemo } from 'react';
import { useNode } from '@toy-box/flow-nodes';
import { isArr } from '@toy-box/toybox-shared';
import { AutoFlow } from '../../../flow/models/AutoFlow'
import { FlowMetaType, FlowMetaParam } from '../../../flow/types'
import { MetaTypes } from './ExtendPanel'
import { usePrefix } from '../../../hooks'
import '../styles/labelPanel.less'

interface LabelPanelProps {
  flowGraph: AutoFlow,
  flowNodeType: FlowMetaType
}

export const LabelPanel: FC<LabelPanelProps> = ({ flowGraph, flowNodeType }) => {
  const node: any = useNode();
  const prefixCls = usePrefix('-label-panel-name')
  const positionFlag = useMemo(() => {
    if (flowNodeType === FlowMetaType.DECISION || flowNodeType === FlowMetaType.LOOP
      || flowNodeType === FlowMetaType.WAIT) return true
    return false
  }, [])
  const style: React.CSSProperties = {
    position: 'absolute',
    top: positionFlag ? '-40px': '0px',
    left: '60px',
    lineHeight: '20px',
  };
  const labelName = useMemo(() => MetaTypes.find((meta) => meta.value === flowNodeType)?.label, [flowNodeType])
  const nodeName = useMemo(() => {
    const flow = flowGraph.mataFlowJson.flow as any
    if (isArr(flow[flowNodeType])) {
      return flow[flowNodeType].find((meta: FlowMetaParam) => meta.id === node.node.id)?.name
    }
  }, [flowGraph.mataFlowJson])
  return (
    <div style={style}>
      <div title={nodeName} className={prefixCls}>{nodeName}</div>
      <div>{labelName}</div>
    </div>
  );
};
