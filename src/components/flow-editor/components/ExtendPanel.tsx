import React, { FC, useState, useCallback, useMemo } from 'react'
import { useNode } from '@toy-box/flow-nodes'
import { isBool } from '@toy-box/toybox-shared'
import { AssignmentModel, DecisionModel, SuspendModel, LoopModel,
  SortCollectionModel, RecordCreateModel, RecordUpdateModel,
  RecordRemoveModel, RecordLookUpModel } from '../../form-model'
import { FlowMetaType, FlowMetaParam } from '../../../flow/types'
import { TextWidget } from '../../widgets'
import { usePrefix } from '../../../hooks'

import '../styles/extendPanel.less'

interface ExtendPanelProps {
  callbackFunc: (id: string, type: FlowMetaType, data: any) => void,
  closeExtend?: () => void,
}

const MetaTypes = [
  {
    label: <TextWidget>flow.extend.assign</TextWidget>,
    value: FlowMetaType.ASSIGNMENTS,
  },
  {
    label: <TextWidget>flow.extend.decision</TextWidget>,
    value: FlowMetaType.DECISIONS,
  },
  {
    label: <TextWidget>flow.extend.suppend</TextWidget>,
    value: FlowMetaType.SUSPENDS,
  },
  {
    label: <TextWidget>flow.extend.loop</TextWidget>,
    value: FlowMetaType.LOOPS,
  },
  {
    label: <TextWidget>flow.extend.collection</TextWidget>,
    value: FlowMetaType.SORT_COLLECTION_PROCESSOR,
  },
  {
    label: <TextWidget>flow.extend.recordCreate</TextWidget>,
    value: FlowMetaType.RECORD_CREATES,
  },
  {
    label: <TextWidget>flow.extend.recordUpdate</TextWidget>,
    value: FlowMetaType.RECORD_UPDATES,
  },
  {
    label: <TextWidget>flow.extend.recordLookup</TextWidget>,
    value: FlowMetaType.RECORD_LOOKUPS,
  },
  {
    label: <TextWidget>flow.extend.recordDelete</TextWidget>,
    value: FlowMetaType.RECORD_DELETES,
  },
]

export const ExtendPanel: FC<ExtendPanelProps> = ({ callbackFunc, closeExtend }) => {
  const prefixCls = usePrefix('-extend-panel')
  const node = useNode()
  const [showModel, setShowModel] = useState(false)
  const [flowMetaType, setFlowMetaType] = useState<FlowMetaType>()

  const assignmentCallBack = useCallback(
    (data, type) => {
      if (!isBool(data)) {
        callbackFunc(node.node.id, type, data)
      }
      setShowModel(false)
    },
    [callbackFunc, node.node.id],
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
      case FlowMetaType.ASSIGNMENTS:
        return <AssignmentModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.DECISIONS:
        return <DecisionModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.SUSPENDS:
        return <SuspendModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.LOOPS:
        return <LoopModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.SORT_COLLECTION_PROCESSOR:
        return <SortCollectionModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.RECORD_CREATES:
        return <RecordCreateModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.RECORD_UPDATES:
        return <RecordUpdateModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.RECORD_LOOKUPS:
        return <RecordLookUpModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />
      case FlowMetaType.RECORD_DELETES:
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
