import React, { FC } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { FlowCanvas, FlowContainer } from './components'
import { FlowGraphMeta } from '../../flow/types'
import { FlowContext } from '../../flow/shared'
import { FlowGraph } from '../../flow/models/FlowGraph'
import ToolBar from '../tool-bar'

import './styles'

const FlowEditor: FC<{ flowMeta: FlowGraphMeta }> = ({ flowMeta }) => {
  const prefixCls = 'flow-editor'
  const flowGraph = new FlowGraph(flowMeta)
  return (
    <div className={prefixCls}>
      <DndProvider backend={HTML5Backend}>
        <ToolBar />
        <FlowContext.Provider value={flowGraph}>
          <FlowContainer>
            <FlowCanvas />
          </FlowContainer>
        </FlowContext.Provider>
      </DndProvider>
    </div>
  )
}

export default FlowEditor
