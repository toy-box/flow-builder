import React, { FC, useState, useCallback, useMemo } from 'react'
import { useNode } from '@toy-box/flow-nodes'
import { isBool } from '@toy-box/toybox-shared'
import { StartModel } from '../../form-model'
import { FlowMetaType, IStartFlowMeta, OpartType, FlowTypeCodeEnum } from '../../../flow/types'
import { TextWidget } from '../../widgets'
import { usePrefix } from '../../../hooks'
import { AutoFlow } from '../../../flow/models/AutoFlow'

import '../styles/extendPanel.less'

interface IStartPanelProps {
  flowGraph: AutoFlow,
  closeExtend?: () => void,
}

const MetaTypes = [
  {
    label: <TextWidget>flow.comm.edit</TextWidget>,
    value: OpartType.EDIT,
  },
  {
    label: <TextWidget>flow.comm.objectId</TextWidget>,
    value: 'objectId',
  },
]

export enum FlowTypeCodeI18nEnum {
  SCREEN = 'flow.flowType.screen',
  PLAN_TRIGGER = 'flow.flowType.planTrigger',
  AUTO_START_UP = 'flow.flowType.autoStartUp',
  RECORD_TRIGGER = 'flow.flowType.recordTrigger',
}

export const StartPanel: FC<IStartPanelProps> = ({ flowGraph, closeExtend }) => {
  const prefixCls = usePrefix('-extend-panel')
  const node = useNode()
  const [showModel, setShowModel] = useState(false)
  const [isObject, setIsObject] = useState(false)
  const [metaFlowData, setMetaFlowData] = useState<IStartFlowMeta>()

  const metaDatas = useMemo(() => {
    return MetaTypes.filter((meta) =>
      !(meta.value === 'objectId' && flowGraph.flowType === FlowTypeCodeEnum.RECORD_TRIGGER))
  }, [flowGraph.flowType, MetaTypes])

  const isEdit = useMemo(() => {
    return (flowGraph.flowType === FlowTypeCodeEnum.RECORD_TRIGGER
      || flowGraph.flowType === FlowTypeCodeEnum.PLAN_TRIGGER)
      && flowGraph.isEdit
  }, [flowGraph.flowType, flowGraph.isEdit])

  const assignmentCallBack = useCallback(
    (data, type) => {
      if (!isBool(data)) {
        flowGraph.editFlowData(node.node.id, type, data)
      }
      setShowModel(false)
    },
    [flowGraph, node.node.id],
  )
  const onSubmit = useCallback(
    (type) => {
      closeExtend && closeExtend()
      const flowStart = flowGraph.flowStart
      if (type === 'objectId') {
        setIsObject(true)
      } else {
        setIsObject(false)
      }
      // const nodeId = node.node.id;
      setMetaFlowData(flowStart as any)
      setShowModel(true)
    },
    [closeExtend, flowGraph.flowStart, node.node.id],
  )
  const titleName = useMemo(() => {
    switch (flowGraph.flowType) {
      case FlowTypeCodeEnum.AUTO_START_UP:
        return <TextWidget>{FlowTypeCodeI18nEnum.AUTO_START_UP}</TextWidget>
      case FlowTypeCodeEnum.PLAN_TRIGGER:
        return <TextWidget>{FlowTypeCodeI18nEnum.PLAN_TRIGGER}</TextWidget>
      case FlowTypeCodeEnum.RECORD_TRIGGER:
        return <TextWidget>{FlowTypeCodeI18nEnum.RECORD_TRIGGER}</TextWidget>
      case FlowTypeCodeEnum.SCREEN:
        return <TextWidget>{FlowTypeCodeI18nEnum.SCREEN}</TextWidget>
      default:
        return ''
    }
  }, [flowGraph.flowType])
  return (
    <div className={prefixCls}>
      {isEdit && <div>
        <div className={`${prefixCls}-title`}>
          {titleName}
        </div>
        <ul className={`${prefixCls}-list`}>
          {
            metaDatas.map(
              (data) => (
                <li key={data.value}>
                  <div onClick={() => onSubmit(data.value)} className={`${prefixCls}-list__item`}>
                    {data.label}
                  </div>
                </li>
            ))
          }
        </ul>
        {showModel && <StartModel 
          flowGraph={flowGraph}
          title={!isObject ? <TextWidget>flow.extend.start</TextWidget> : <TextWidget>flow.extend.objectId</TextWidget>} 
          startData={metaFlowData} 
          showModel={showModel} 
          isObject={isObject}
          callbackFunc={(data: IStartFlowMeta | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />}
      </div>}
    </div>
  )
}
