import React, { FC, useState, useCallback, useMemo } from 'react'
import { useNode } from '@toy-box/flow-nodes'
import { isBool } from '@toy-box/toybox-shared'
import { AssignmentModel, DecisionModel, SuspendModel, LoopModel,
  SortCollectionModel, RecordCreateModel, RecordUpdateModel,
  RecordRemoveModel, RecordLookUpModel } from '../../form-model'
import { FlowMetaType, FlowMetaParam, FlowType } from '../../../flow/types'
import { TextWidget } from '../../widgets'
import { usePrefix } from '../../../hooks'
import { AutoFlow } from '../../../flow/models/AutoFlow'

import '../styles/extendPanel.less'

interface ExtendPanelProps {
  flowGraph: AutoFlow,
  closeExtend?: () => void,
}

export const MetaTypes = [
  {
    label: <TextWidget>flow.extend.assign</TextWidget>,
    value: FlowMetaType.ASSIGNMENT,
  },
  {
    label: <TextWidget>flow.extend.decision</TextWidget>,
    value: FlowMetaType.DECISION,
  },
  {
    label: <TextWidget>flow.extend.suppend</TextWidget>,
    value: FlowMetaType.WAIT,
  },
  {
    label: <TextWidget>flow.extend.loop</TextWidget>,
    value: FlowMetaType.LOOP,
  },
  {
    label: <TextWidget>flow.extend.collection</TextWidget>,
    value: FlowMetaType.SORT_COLLECTION_PROCESSOR,
  },
  {
    label: <TextWidget>flow.extend.recordCreate</TextWidget>,
    value: FlowMetaType.RECORD_CREATE,
  },
  {
    label: <TextWidget>flow.extend.recordUpdate</TextWidget>,
    value: FlowMetaType.RECORD_UPDATE,
  },
  {
    label: <TextWidget>flow.extend.recordLookup</TextWidget>,
    value: FlowMetaType.RECORD_LOOKUP,
  },
  {
    label: <TextWidget>flow.extend.recordDelete</TextWidget>,
    value: FlowMetaType.RECORD_DELETE,
  },
]

export const ExtendPanel: FC<ExtendPanelProps> = ({ flowGraph, closeExtend }) => {
  const prefixCls = usePrefix('-extend-panel')
  const node = useNode()
  const [showModel, setShowModel] = useState(false)
  const [flowMetaType, setFlowMetaType] = useState<FlowMetaType>()

  const metaDatas = useMemo(() => {
    return MetaTypes.filter((meta) =>
      !(meta.value === FlowMetaType.WAIT && flowGraph.flowType === 'RECORD_TRIGGER'))
  }, [flowGraph.flowType, MetaTypes])

  const assignmentCallBack = useCallback(
    (data, type) => {
      if (!isBool(data)) {
        flowGraph.updateInitialMeta(node.node.id, type, data)
      }
      setShowModel(false)
    },
    [flowGraph, node.node.id],
  )
  const onSubmit = useCallback(
    (type) => {
      closeExtend && closeExtend()
      setFlowMetaType(type)
      setShowModel(true)
    },
    [closeExtend],
  )
  const models = useMemo(() => {
    switch (flowMetaType) {
      case FlowMetaType.ASSIGNMENT:
        return <AssignmentModel flowGraph={flowGraph} showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.DECISION:
        return <DecisionModel flowGraph={flowGraph} showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.WAIT:
        return <SuspendModel flowGraph={flowGraph} showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.LOOP:
        return <LoopModel flowGraph={flowGraph} showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.SORT_COLLECTION_PROCESSOR:
        return <SortCollectionModel flowGraph={flowGraph} showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.RECORD_CREATE:
        return <RecordCreateModel flowGraph={flowGraph} showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.RECORD_UPDATE:
        return <RecordUpdateModel flowGraph={flowGraph} showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.RECORD_LOOKUP:
        return <RecordLookUpModel flowGraph={flowGraph} showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.RECORD_DELETE:
        return <RecordRemoveModel flowGraph={flowGraph} showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      default:
        return null
    }
  }, [assignmentCallBack, flowGraph, flowMetaType, showModel])
  return (
    <div className={prefixCls}>
      <div className={`${prefixCls}-title`}>
        <TextWidget>flow.extend.title</TextWidget>
      </div>
      <ul className={`${prefixCls}-list`}>
        {
          metaDatas.map(
            (data) => (<li key={data.value}>
                <div onClick={() => onSubmit(data.value)} className={`${prefixCls}-list__item`}>
                  {data.label}
                </div>
              </li>
            )
          )
        }
      </ul>
      {models}
    </div>
  )
}
