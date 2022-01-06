import React, { FC, useCallback, useMemo } from 'react';
import { useNode } from '@toy-box/flow-nodes';
import { isArr } from '@toy-box/toybox-shared';
import { AutoFlow } from '../../../flow/models/AutoFlow'
import { FlowMetaType, FlowMetaParam, FlowTypeCodeEnum } from '../../../flow/types'
import { FlowTypeCodeI18nEnum } from './StartPanel'
import { usePrefix } from '../../../hooks'
import { TextWidget } from '../../widgets'
import '../styles/labelPanel.less'

interface StartLabelPanelProps {
  flowGraph: AutoFlow,
  flowNodeType: FlowMetaType
}

export const StartLabelPanel: FC<StartLabelPanelProps> = ({ flowGraph, flowNodeType }) => {
  const node: any = useNode();
  const prefixCls = usePrefix('-label-panel-name')
  const style: React.CSSProperties = {
    position: 'absolute',
    top: '0px',
    left: '60px',
    lineHeight: '20px',
  };

  const titleName = useMemo(() => {
    switch (flowGraph.flowType) {
      case FlowTypeCodeEnum.AUTO_START_UP:
        return FlowTypeCodeI18nEnum.AUTO_START_UP
      case FlowTypeCodeEnum.PLAN_TRIGGER:
        return FlowTypeCodeI18nEnum.PLAN_TRIGGER
      case FlowTypeCodeEnum.RECORD_TRIGGER:
        return FlowTypeCodeI18nEnum.RECORD_TRIGGER
      case FlowTypeCodeEnum.SCREEN:
        return FlowTypeCodeI18nEnum.SCREEN
      default:
        return ''
    }
  }, [flowGraph.flowType])

  return (
    <div style={style}>
      <div className={prefixCls}>{<TextWidget>{titleName}</TextWidget>}</div>
      <div><TextWidget>flow.extend.start</TextWidget></div>
    </div>
  );
};
