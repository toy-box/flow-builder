import React, { FC, useEffect } from 'react'
import { FlowChart, ListUnordered } from '@airclass/icons'
import { AntvCanvas } from './components'
import { FlowGraphMeta } from '../../flow/types'
import { FlowContext } from '../../flow/shared'
import { AutoFlow } from '../../flow/models/AutoFlow'
import { fieldMetaStore } from '../../store'
import { CompositePanel } from '../composite-panel'
import { ResourceWidget } from '../widgets'
import { usePrefix, useService } from '../../hooks'

import './styles'
import { NodeWidget } from '../node-widget'
import * as MetaObjectService from '../../services/metaObject.service'

export const FlowEditor: FC<{ flowGraph: AutoFlow }> = ({ flowGraph }) => {
  const prefixCls = usePrefix('-editor')
  const { getMetaObjectData } = useService()
  // const flowGraph = new AutoFlow(flowMeta)
  const { initRegisters } = fieldMetaStore.fieldMetaStore

  useEffect(() => {
    getMetaObjectData().then(({ data }) => {
      initRegisters(data);
    })
  }, [initRegisters])

  return (
    <div className={prefixCls}>
      <div className={`${prefixCls}-content`}>
        <FlowContext.Provider value={flowGraph}>
          {/* <CompositePanel>
            <CompositePanel.Item title="panels.Flow" icon={<FlowChart />}>
              <NodeWidget />
            </CompositePanel.Item>
            <CompositePanel.Item title="panels.Data" icon={<ListUnordered />}>
              <ResourceWidget flowGraph={flowGraph}/>
            </CompositePanel.Item>
          </CompositePanel> */}
          <AntvCanvas />
        </FlowContext.Provider>
      </div>
    </div>
  )
}
