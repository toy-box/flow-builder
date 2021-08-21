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

export const FlowDesigner = () => {
  return (
    <DesignerContext.Provider value={{ prefix: 'fd', GlobalRegistry }}>
      <Navbar />
      <FlowEditor flowMeta={flowMeta} />
    </DesignerContext.Provider>
  )
}

