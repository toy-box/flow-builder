import React from 'react'
import { useFlowNodes } from '../../flow/hooks/useFlowNodes'
import { usePrefix } from '../../hooks'

export const NodeWidget = () => {
  const prefixCls = usePrefix('-node-widget')
  const flowNodes = useFlowNodes()
  return <div className={prefixCls}>
    <ul className={`${prefixCls}-list`}>
      {
        flowNodes.map(node => <li key={node.id}>{node.label}</li>)
      }
    </ul>
  </div>
}