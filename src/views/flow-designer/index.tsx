import React from 'react'
import { GlobalRegistry} from '../../designer'
import { Navbar, FlowEditor} from '../../components'
import { DesignerContext } from '../../designer'
import { flow } from './data'

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
      },
      autoFlow: {
        variable: '变量',
        variableArray: '集合变量',
        variableArrayRecord: '集合记录变量',
        constant: '常量',
        formula: '公式',
        template: '模板',
      }
    }
  }
})

GlobalRegistry.setDesignerLanguage('zh-CN')

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

