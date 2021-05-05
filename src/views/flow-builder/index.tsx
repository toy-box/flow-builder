import React from 'react'
import { Layout } from 'antd'
import FlowEditor from '../../components/flow-editor'
import { FlowNodeMeta } from '../../flow/types'
import './style.less'

const { Header } = Layout

const nodes: FlowNodeMeta[] = []

const flowMeta = {
  id: 'flow-meta-1',
  name: 'flow',
  nodes: nodes,
}


function FlowBuilder() {
  return (
    <div className="flow-builder">
      <Header />
      <FlowEditor flowMeta={flowMeta} />
    </div>
  )
}

export default FlowBuilder
