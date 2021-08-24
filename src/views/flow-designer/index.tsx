import React from 'react'
import { GlobalRegistry} from '../../designer'
import { Navbar, FlowEditor} from '../../components'
import { DesignerContext } from '../../designer'
import { FlowMeta } from '../../flow/types'

import './style.less'

GlobalRegistry.registerDesignerLocales({
  'zh-CN': {
    panels: {
      Flow: '流程节点',
      Data: '数据',
    },
    flow: {
      extend: {
        title: '添加流程节点',
        assign: '分配',
        decision: '决策',
        suppend: '暂停',
        loop: '循环',
        collection: '集合排序',
        recordCreate: '创建记录',
        recordUpdate: '更新记录',
        recordLookup: '记录查询',
        recordDelete: '记录删除',
      }
    }
  }
})

GlobalRegistry.setDesignerLanguage('zh-CN')

const flow: FlowMeta = {
  "start": {
    "id": "start",
    "name": "开始",
    "connector": {
      "targetReference": 'decision1'
    },
    "defaultConnector": {
      "targetReference": 'end'
    },
  },
  "assignments": [
    {
      "id": "1111",
      "name": "1111",
      "connector": {
        "targetReference": null
      },
    },
    {
      "id": "2222",
      "name": "2222",
      "connector": {
        "targetReference": "loop1"
      },
    },
    {
      "id": "3333",
      "name": "3333",
      "connector": {
        "targetReference": "loop1"
      },
    },
  ],
  "decisions": [
    {
      "id": "decision1",
      "name": "decision1",
      "connector": {
        "targetReference": 'end'
      },
      "defaultConnector": {
        "targetReference": "2222"
      },
      "defaultConnectorName": "默认分支",
      "rules": [
        {
          "id": "fork1",
          "name": "分支1",
          "description": "分支1",
          "connector": {
            "targetReference": null
          },
          "criteria": {
            "conditions": [
            ]
          }
        },
      ],
    },
  ],
  "loops": [
    {
      "id": "loop1",
      "name": "循环1",
      "nextValueConnector": {
        "targetReference": "loop2"
      },
      "defaultConnector": {
        "targetReference": "1111"
      },
      "collectionReference": "list1",
      "iterationOrder": "desc"
    },
    {
      "id": "loop2",
      "name": "循环1",
      "nextValueConnector": {
        "targetReference": null
      },
      "defaultConnector": {
        "targetReference": "3333"
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

export const FlowDesigner = () => {
  return (
    <DesignerContext.Provider value={{ prefix: 'fd', GlobalRegistry }}>
      <Navbar />
      <FlowEditor flowMeta={flowMeta} />
    </DesignerContext.Provider>
  )
}

