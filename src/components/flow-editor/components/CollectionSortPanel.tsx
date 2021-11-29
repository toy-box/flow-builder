import React, { FC, useState, useCallback, useMemo } from 'react'
import { useNode } from '@toy-box/flow-nodes'
import { isBool } from '@toy-box/toybox-shared'
import { SortCollectionModel } from '../../form-model'
import { FlowMetaType, FlowMetaParam, OpartType } from '../../../flow/types'
import { TextWidget } from '../../widgets'
import { usePrefix } from '../../../hooks'
import { AutoFlow } from '../../../flow/models/AutoFlow'

import '../styles/extendPanel.less'

interface ExtendEditPanelProps {
  flowGraph: AutoFlow,
  closeExtend?: () => void,
}

const MetaTypes = [
  {
    label: <TextWidget>flow.comm.edit</TextWidget>,
    value: OpartType.EDIT,
  },
  {
    label: <TextWidget>flow.comm.delete</TextWidget>,
    value: OpartType.REMOVE,
  },
]

export const CollectionSortPanel: FC<ExtendEditPanelProps> = ({ flowGraph, closeExtend }) => {
  const prefixCls = usePrefix('-extend-panel')
  const node = useNode()
  const [showModel, setShowModel] = useState(false)
  const [metaFlowData, setMetaFlowData] = useState<FlowMetaParam>()

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
      const flowSortCollections = flowGraph.flowSortCollections
      const nodeId = node.node.id;
      const metaData = flowSortCollections.find((meta) => meta.id === nodeId);
      if (type === OpartType.REMOVE && metaData) {
        flowGraph.removeFlowData(nodeId, FlowMetaType.SORT_COLLECTION_PROCESSOR, metaData)
      } else {
        setMetaFlowData(metaData)
        setShowModel(true)
      }
    },
    [closeExtend, flowGraph.flowSortCollections, node.node.id],
  )
  return (
    <div className={prefixCls}>
      <div className={`${prefixCls}-title`}>
        <TextWidget>flow.extend.collection</TextWidget>
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
      {<SortCollectionModel 
        flowGraph={flowGraph}
        title={<TextWidget>flow.form.sortCollection.editTitle</TextWidget>} 
        metaFlowData={metaFlowData} 
        showModel={showModel} 
        callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />}
    </div>
  )
}
