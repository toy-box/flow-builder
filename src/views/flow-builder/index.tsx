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
    },
    "defaultConnector": {
      "targetReference": "11123232323232323"
    },
  },
  "assignments": [{
    "id": '1111',
    "name": '11111',
    "connector": {
      "targetReference": "loop2",
    },
    "defaultConnector": {
      "targetReference": "11123232323232323"
    },
  }, {
    "id": '2222',
    "name": '2222',
    "connector": {
      "targetReference": "11123232323232323",
    },
    "defaultConnector": {
      "targetReference": "11123232323232323"
    },
  }, {
    "id": '3333',
    "name": '3333',
    "connector": {
      "targetReference": "1233333",
    },
    "defaultConnector": {
      "targetReference": "11123232323232323"
    },
  }],
  "decisions": [
    {
      "id": "decision1",
      "name": "decision1",
      "connector": {
        "targetReference": "11123232323232323",
      },
      "defaultConnector": {
        "targetReference": '1233333'
      },
      "defaultConnectorName": "默认分支",
      "rules": [
        {
          "id": "rule1",
          "name": "分支1",
          "description": "分支1",
          "connector": {
            "targetReference": '3333'
          },
          "criteria": {
            "conditions": []
          }
        },
      ]
    }
  ],
  "loops": [
    {
      "id": "loop1",
      "name": "循环1",
      "nextValueConnector": {
        "targetReference": null
      },
      "defaultConnector": {
        "targetReference": "2222"
      },
      "collectionReference": "list1",
      "iterationOrder": "desc"
    },
    {
      "id": "loop2",
      "name": "循环2",
      "nextValueConnector": {
        "targetReference": '1111'
      },
      "defaultConnector": {
        "targetReference": "loop1"
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
