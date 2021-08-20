import React from 'react'
import { Layout } from 'antd'
import FlowEditor from '../../components/flow-editor'
import { FlowMeta } from '../../flow/types'
import './style.less'

const { Header } = Layout

const flow: FlowMeta = {
  "start": {
    "id": "start",
    "name": "开始",
    "connector": {
      "targetReference": 'loop1'
    }
  },
  "loops": [
    {
      "id": "loop1",
      "name": "循环1",
      "nextValueConnector": {
        "targetReference": null
      },
      "defaultConnector": {
        "targetReference": null
      },
      "collectionReference": "list1",
      "iterationOrder": "desc"
    },
  ],
}

const flowMeta = {
  id: 'flow-meta-1',
  name: 'flow',
  flow: flow,
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
