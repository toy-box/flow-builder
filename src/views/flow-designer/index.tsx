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
      },
      form: {
        comm: {
          label: '标签',
          value: 'API名称',
          description: '描述',
          cencel: '取消',
          submit: '确定',
          empty: '暂无数据',
        },
        validator: {
          filter: '条件分支不能为空',
          label: '标签是必填项',
          value: 'API名称是必填项',
          suspendLabel: '暂停配置标签是必填项',
          registerId: '对象记录是必填项',
          field: '字段是必填项',
          recordIdValue: '记录是必填项',
          dateValue: '基本时间是必填项',
          offsetUnit: '请输入“Hours”或“Days”'
        },
        assignment: {
          addTitle: '新建分配',
          editTitle: '编辑分配',
          removeTitle: '删除分配',
          setVariable: '设置变量值',
          tip: '每个变量由运算符和值组合修改。',
        },
        decision: {
          addTitle: '新建决策',
          editTitle: '编辑决策',
          removeTitle: '删除决策',
          defaultConnectorName: '默认分支',
          title: '新结果',
          sortTitle: '结果顺序',
          removeResult: '删除结果',
          name: '结果',
          tip: '对于流可以使用的每个路径，创建结果。对于每个结果，指定必须满足的条件，以便流使用该路径。',
        }
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

