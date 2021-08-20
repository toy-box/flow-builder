import React, { FC } from 'react'
import { useDrop } from 'react-dnd'
import { useFlowGraph } from '../../../flow/hooks/useFlowGraph'
import { makeNodeFromPack } from '../makeFlowItem'

import '../styles/flowContainer.less'

const FlowContainer: FC = ({
  children
}) => {
  const flowGraph = useFlowGraph()

  const [, dropRef] = useDrop({
    accept: ['flowItem'],
    drop: (item: any, monitor) => {
      const currentMouseOffset = monitor.getClientOffset()
      const sourceMouseOffset = monitor.getInitialClientOffset()
      const sourceElementOffset = monitor.getInitialSourceClientOffset()
      const diffX = sourceMouseOffset!.x - sourceElementOffset!.x
      const diffY = sourceMouseOffset!.y - sourceElementOffset!.y
      const x = currentMouseOffset!.x - diffX
      const y = currentMouseOffset!.y - diffY
      // if (flowGraph.graph) {
      //   const pos = flowGraph.graph.clientToLocal(x, y);
      //   flowGraph.createNode(makeNodeFromPack(pos.x, pos.y, item.type, flowGraph))
      // }
    },
  })

  return (
    <div className="flow-canvas" ref={dropRef}>
      {children}
    </div>
  )
}

export default FlowContainer
