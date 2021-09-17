import React, { FC, useState, useCallback, useMemo } from 'react'
import { useNode } from '@toy-box/flow-nodes'
import { isBool } from '@toy-box/toybox-shared'
import { AssignmentModel, DecisionModel, SuspendModel, LoopModel,
  SortCollectionModel, RecordCreateModel, RecordUpdateModel,
  RecordRemoveModel, RecordLookUpModel } from '../../form-model'
import { FlowMetaType, FlowMetaParam } from '../../../flow/types'
import { TextWidget } from '../../widgets'
import { usePrefix } from '../../../hooks'
import { AutoFlow } from '../../../flow/models/AutoFlow'

import '../styles/extendPanel.less'

interface ExtendPanelProps {
  callbackFunc: (id: string, type: FlowMetaType, data: any) => void,
  flowGraph: AutoFlow,
  closeExtend?: () => void,
}

const MetaTypes = [
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
    value: FlowMetaType.SUSPEND,
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

export const ExtendPanel: FC<ExtendPanelProps> = ({ callbackFunc, flowGraph, closeExtend }) => {
  const prefixCls = usePrefix('-extend-panel')
  const node = useNode()
  const [showModel, setShowModel] = useState(false)
  const [flowMetaType, setFlowMetaType] = useState<FlowMetaType>()

  const assignmentCallBack = useCallback(
    (data, type) => {
      if (!isBool(data)) {
        flowGraph.updateInitialMeta(node.node.id, type, data)
        callbackFunc(node.node.id, type, data)
      }
      setShowModel(false)
    },
    [callbackFunc, flowGraph, node.node.id],
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
        return <AssignmentModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.DECISION:
        return <DecisionModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.SUSPEND:
        return <SuspendModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.LOOP:
        return <LoopModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.SORT_COLLECTION_PROCESSOR:
        return <SortCollectionModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.RECORD_CREATE:
        return <RecordCreateModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.RECORD_UPDATE:
        return <RecordUpdateModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.RECORD_LOOKUP:
        return <RecordLookUpModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.RECORD_DELETE:
        return <RecordRemoveModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      default:
        return null
    }
  }, [assignmentCallBack, flowMetaType, showModel])
  return (
    <div className={prefixCls}>
      <div className={`${prefixCls}-title`}>
        <TextWidget>flow.extend.title</TextWidget>
      </div>
      <ul className={`${prefixCls}-list`}>
        {
          MetaTypes.map(
            (data) => (
              <li key={data.value}>
                <div onClick={() => onSubmit(data.value)} className={`${prefixCls}-list__item`}>
                  {data.label}
                </div>
              </li>
          ))
        }
      </ul>
      {models}
    </div>
  )
}
