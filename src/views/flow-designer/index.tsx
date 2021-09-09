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
      metaType: {
        text: '文本',
        str: '字符串',
        num: '数字',
        objectId: '记录',
        bool: '布尔值',
        date: '日期',
        dateTime: '时间',
        singleOption: '单选列表',
        multiOption: '多选列表',
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
          offsetUnit: '请输入“Hours”或“Days”',
          collectionReference: '集合变量是必填项',
          iterationOrder: '排序方向是必填项',
          limit: '输入项是数字',
          sortOptions: '排序项是必填项',
          sortField: '排序方式是必填项'
        },
        placeholder: {
          recordIdValue: '请选择记录',
          dateValue: '请选择时间数据'
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
        },
        suspend: {
          addTitle: '新建暂停',
          editTitle: '编辑暂停',
          removeTitle: '删除暂停',
          title: '新建暂停配置',
          sortTitle: '暂停配置',
          removeBtn: '删除暂停配置',
          option: {
            time: '特定时间',
            recordTime: '记录时间'
          },
          rule: {
            name: '暂停配置标签',
            sourceTime: '时间源',
            registerId: '获取对象记录',
            field: '字段',
            recordIdValue: '记录',
            dateValue: '基本时间',
            offsetNum: '偏移数字',
            offsetUnit: '偏移单位（小时或天数）',
          },
          tip: '对于每个可以恢复流的事件，添加暂停配置。此事件可以指定时间或平台事件消息。暂停条件确定是否在事件发生之前暂停流。在未满足暂停条件时，流会使用默认路径，而不暂停。',
        },
        loop: {
          addTitle: '新建循环',
          editTitle: '编辑循环',
          removeTitle: '删除循环',
          collectionReference: '集合变量',
          iterationOrder: '排序方向',
          iterationOrderOption: {
            asc: '第一个项目到最后一个项目',
            desc: '最后一个项目到第一个项目'
          }
        },
        sortCollection: {
          addTitle: '新建集合排序',
          editTitle: '编辑集合排序',
          removeTitle: '删除集合排序',
          collectionReference: '集合变量',
          sortField: '排序方式',
          sortOrder: '排序顺序',
          sortOrderOption: {
            asc: '升序',
            desc: '降序',
          },
          doesPutEmptyStringAndNullFirst: '请先放入空字符串和空值',
          addSortItem: '添加排序选项',
          limitFlag: '在排序后保留的项目数量',
          limitFlagOption: {
            all: '保留所有选项',
            count: '设置最大项目数量'
          },
          limit: '保留前几个项目，直到指定的最大数量，并移除剩余项目'
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

