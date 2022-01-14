// import { useFlowNodes } from '../../flow/hooks/useFlowNodes'
import React, { useCallback, useState } from 'react'
import { observer } from '@formily/react'
import { Collapse } from 'antd';
import { isBool } from '@toy-box/toybox-shared';
import { usePrefix } from '../../../hooks'
import { AutoFlow } from '../../../flow/models/AutoFlow'
import { ResourceCreate } from '../../form-model/ResourceCreate'
import { IFlowResourceType, FlowMetaParam, FlowMetaType, IFieldMetaFlow } from '../../../flow/types'
import { RecordLookUpModel } from '../../form-model'
import { TextWidget } from '../TextWidget'
import './index.less'

const { Panel } = Collapse;

export interface IResourceWidgetProps {
  flowGraph: AutoFlow
}

export const ResourceWidget: React.FC<IResourceWidgetProps> = observer(({flowGraph}) => {
  const [defaultActiveKey] = useState()
  const [showModel, setShowModel] = useState(false)
  const prefixCls = usePrefix('-resource-widget')
  const fieldMetas = flowGraph.fieldMetas
  const changeValue = useCallback((value) => {

  }, [])
  const editBtn = useCallback(() => {
    setShowModel(true)
  }, [])

  const assignmentCallBack = useCallback(
    (data, type, nodeId) => {
      if (!isBool(data)) {
        flowGraph.editFlowData(nodeId, type, data)
      }
      setShowModel(false)
    },
    [flowGraph],
  )

  const metaFlowData = useCallback(
    (child) => {
      return flowGraph.recordLookups.find((data) => data.id === child.key)
    },
    [],
  )
  
  return <div className={prefixCls}>
    <Collapse
        defaultActiveKey={defaultActiveKey}
        onChange={changeValue}
      >
      {
        fieldMetas.map(meta => <Panel header={meta.label} key={meta.value}>
          {meta.children && <ul className={`${prefixCls}-list`}>
            {
              meta.children.map((child: IFieldMetaFlow) => <li key={child.key}>
                {child?.flowMetaType !== FlowMetaType.RECORD_LOOKUP ? <ResourceCreate 
                  fieldMetas={flowGraph.fieldMetas as any[]}
                  flowGraph={flowGraph}
                  isOpBtn={false}
                  fieldType={meta.value}
                  opName={child.name}
                  value={child as any}
                  title="编辑资源"
                />
                : <div>
                    <span onClick={editBtn}>{child.name}</span>
                    <RecordLookUpModel 
                      flowGraph={flowGraph} 
                      showModel={showModel} 
                      title={<TextWidget>flow.form.recordLookUp.editTitle</TextWidget>} 
                      metaFlowData={metaFlowData(child)}
                      callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaType) => assignmentCallBack(data, type, child.key)}/>
                  </div>
              }
              </li>)
            }
          </ul>}
        </Panel>)
      }
    </Collapse>
  </div>
})