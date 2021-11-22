// import { useFlowNodes } from '../../flow/hooks/useFlowNodes'
import React, { useCallback, useState } from 'react'
import { observer } from '@formily/react'
import { Collapse } from 'antd';
import { usePrefix } from '../../../hooks'
import { AutoFlow } from '../../../flow/models/AutoFlow'
import { ResourceCreate } from '../../form-model/ResourceCreate'
import './index.less'

const { Panel } = Collapse;

export interface IResourceWidgetProps {
  flowGraph: AutoFlow
}

export const ResourceWidget: React.FC<IResourceWidgetProps> = observer(({flowGraph}) => {
  const [defaultActiveKey] = useState()
  const prefixCls = usePrefix('-resource-widget')
  const fieldMetas = flowGraph.fieldMetas
  const changeValue = useCallback((value) => {

  }, [])
  const editBtn = useCallback(() => {

  }, [])
  
  return <div className={prefixCls}>
    <Collapse
        defaultActiveKey={defaultActiveKey}
        onChange={changeValue}
      >
      {
        fieldMetas.map(meta => <Panel header={meta.label} key={meta.value}>
          {meta.children && <ul className={`${prefixCls}-list`}>
            {
              meta.children.map((child) => <li onClick={editBtn} key={child.key}>
                <ResourceCreate 
                  fieldMetas={flowGraph.fieldMetas as any[]}
                  flowGraph={flowGraph}
                  isOpBtn={false}
                  opName={child.name}
                  value={child as any}
                  title="编辑变量"
                />
              </li>)
            }
          </ul>}
        </Panel>)
      }
    </Collapse>
  </div>
})