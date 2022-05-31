import React, { FC, useState, useCallback } from 'react'
import { useNode } from '@toy-box/flow-nodes'
import { isBool } from '@toy-box/toybox-shared'
import { RecordLookUpModel } from '../../form-model'
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

export const RecordSearchPanel: FC<ExtendEditPanelProps> = ({ flowGraph, closeExtend }) => {
  const prefixCls = usePrefix('-extend-panel')
  const node = useNode()
  const [showModel, setShowModel] = useState(false)
  const [metaFlowData, setMetaFlowData] = useState<FlowMetaParam>()

  const assignmentCallBack = useCallback(
    (data: any, type?: FlowMetaType) => {
      if (!isBool(data) && type) {
        flowGraph.editFlowData(node.node.id, type, data)
      }
      setShowModel(false)
    },
    [flowGraph, node.node.id],
  )
  const onSubmit = useCallback(
    (type: OpartType) => {
      closeExtend && closeExtend()
      const recordLookups = flowGraph.recordLookups
      const nodeId = node.node.id;
      const metaData = recordLookups.find((meta) => meta.id === nodeId);
      if (type === OpartType.REMOVE && metaData) {
        flowGraph.removeFlowData(nodeId, FlowMetaType.RECORD_LOOKUP, metaData)
      } else {
        setMetaFlowData(metaData)
        setShowModel(true)
      }
    },
    [closeExtend, flowGraph.recordLookups, node.node.id],
  )
  return (
    <div className={prefixCls}>
      {flowGraph.isEdit && <div>
        <div className={`${prefixCls}-title`}>
          <TextWidget>flow.extend.recordLookup</TextWidget>
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
        {showModel && <RecordLookUpModel 
          flowGraph={flowGraph}
          title={<TextWidget>flow.form.recordLookUp.editTitle</TextWidget>} 
          metaFlowData={metaFlowData} 
          showModel={showModel} 
          callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type)} />}
      </div>}
    </div>
  )
}
