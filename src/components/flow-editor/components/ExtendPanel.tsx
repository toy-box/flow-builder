import React, { FC, useState, useCallback, useMemo } from 'react'
import { useNode } from '@toy-box/flow-nodes'
import { isBool } from '@toy-box/toybox-shared'
import { AssignmentModel, DecisionModel, SuspendModel, LoopModel,
  SortCollectionModel, RecordCreateModel, RecordUpdateModel,
  RecordRemoveModel, RecordLookUpModel } from '../../form-model'
import { FlowMetaTypes, FlowMetaParam } from '../../../flow/types'
import { TextWidget } from '../../widgets'
import { usePrefix } from '../../../hooks'

import '../styles/extendPanel.less'

interface ExtendPanelProps {
  callbackFunc: (id: string, type: FlowMetaTypes, data: any) => void,
  closeExtend?: () => void,
}

const MetaTypes = [
  {
    label: <TextWidget>flow.extend.assign</TextWidget>,
    value: FlowMetaTypes.ASSIGNMENTS,
  },
  {
    label: <TextWidget>flow.extend.decision</TextWidget>,
    value: FlowMetaTypes.DECISIONS,
  },
  {
    label: <TextWidget>flow.extend.suppend</TextWidget>,
    value: FlowMetaTypes.SUSPENDS,
  },
  {
    label: <TextWidget>flow.extend.loop</TextWidget>,
    value: FlowMetaTypes.LOOPS,
  },
  {
    label: <TextWidget>flow.extend.collection</TextWidget>,
    value: FlowMetaTypes.SORT_COLLECTION_PROCESSOR,
  },
  {
    label: <TextWidget>flow.extend.recordCreate</TextWidget>,
    value: FlowMetaTypes.RECORD_CREATES,
  },
  {
    label: <TextWidget>flow.extend.recordUpdate</TextWidget>,
    value: FlowMetaTypes.RECORD_UPDATES,
  },
  {
    label: <TextWidget>flow.extend.recordLookup</TextWidget>,
    value: FlowMetaTypes.RECORD_LOOKUPS,
  },
  {
    label: <TextWidget>flow.extend.recordDelete</TextWidget>,
    value: FlowMetaTypes.RECORD_DELETES,
  },
]

export const ExtendPanel: FC<ExtendPanelProps> = ({ callbackFunc, closeExtend }) => {
  const prefixCls = usePrefix('-extend-panel')
  const node = useNode()
  const [showModel, setShowModel] = useState(false)
  const [flowMetaType, setFlowMetaType] = useState<FlowMetaTypes>()

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
      case FlowMetaTypes.ASSIGNMENTS:
        return <AssignmentModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaTypes) => assignmentCallBack(data, type)} />
      case FlowMetaTypes.DECISIONS:
        return <DecisionModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaTypes) => assignmentCallBack(data, type)} />
      case FlowMetaTypes.SUSPENDS:
        return <SuspendModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaTypes) => assignmentCallBack(data, type)} />
      case FlowMetaTypes.LOOPS:
        return <LoopModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaTypes) => assignmentCallBack(data, type)} />
      case FlowMetaTypes.SORT_COLLECTION_PROCESSOR:
        return <SortCollectionModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaTypes) => assignmentCallBack(data, type)} />
      case FlowMetaTypes.RECORD_CREATES:
        return <RecordCreateModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaTypes) => assignmentCallBack(data, type)} />
      case FlowMetaTypes.RECORD_UPDATES:
        return <RecordUpdateModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaTypes) => assignmentCallBack(data, type)} />
      case FlowMetaTypes.RECORD_LOOKUPS:
        return <RecordLookUpModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaTypes) => assignmentCallBack(data, type)} />
      case FlowMetaTypes.RECORD_DELETES:
        return <RecordRemoveModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaTypes) => assignmentCallBack(data, type)} />
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
