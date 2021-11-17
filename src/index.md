---
nav:
  title: Components
  path: /components
---

Install dependencies,

```bash
$ npm i flow-builder
```

## 头部菜单

```tsx
import React, { useState, useEffect } from 'react';
import {
  GlobalRegistry,
  Navbar, FlowEditor,
  DesignerContext,
  flow, initData, getFlowData, getFlowModelData, getmetaObjectData
} from 'flow-builder';
// import 'antd/dist/antd.css';
// import 'codemirror/lib/codemirror.css';

GlobalRegistry.registerDesignerLocales({
  'zh-CN': {
    panels: {
      Flow: '流程节点',
      Data: '数据',
    },
    flow: {
      comm: {
        edit: '编辑元素',
        delete: '删除元素',
      },
      metaValueType: {
        add: '添加',
        subtract: '减少',
        assign: '等于',
        addAtStart: '添加到第一个',
        removeFirst: '移除第一个',
        removeAll: '移除所有',
      },
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
        variableRecord: '记录（单个）变量',
        variableArray: '集合变量',
        variableArrayRecord: '集合记录变量',
        constant: '常量',
        formula: '公式',
        template: '模板',
      },
      metaType: {
        text: '大段文本',
        str: '文本',
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
          label: '标题',
          value: 'API名称',
          description: '描述',
          cencel: '取消',
          submit: '确定',
          empty: '暂无数据',
          reference: '引用变量',
          input: '直接输入'
        },
        validator: {
          filter: '筛选记录是必填项',
          label: '标题是必填项',
          value: 'API名称是必填项',
          suspendLabel: '暂停配置标题是必填项',
          registerId: '对象记录是必填项',
          field: '字段是必填项',
          recordIdValue: '记录是必填项',
          dateValue: '基本时间是必填项',
          offsetUnit: '请输入“Hours”或“Days”',
          collectionReference: '集合变量是必填项',
          iterationOrder: '排序方向是必填项',
          limit: '输入项是数字',
          sortOptions: '排序项是必填项',
          sortField: '排序方式是必填项',
          flowType: '资源类型是必填项',
          name: '资源名称是必填项',
          repeatName: 'API名称重复',
          type: '数据类型是必填项',
          refObjectId: '对象值是必填项',
          text: '模板是必填项',
          expression: '公式是必填项',
          inputAssignments: '字段值是必填项',
          sortOrderIsEmpty: '排序标准是必填项',
          outputReference: '记录变量是必填项',
          resourceRegRuleMessage: 'API名称仅可以包含下划线和字母数字字符',
          queriedFields: '指定字段不能为空'
        },
        placeholder: {
          recordIdValue: '请选择记录',
          dateValue: '请选择时间数据',
          flowType: '请选择...',
          name: '请输入名称...',
          description: '请输入描述...',
          type: '请选择数据类型...',
          refObjectId: '请输入值...',
          assignRecordIdToReference: '请选择变量',
          outputReference: '选择记录变量',
          formula: '请输入公式',
          resourceSelect: '请选择集合变量',
          formilyInput: {
            input: '请输入值',
            select: '请选择值',
            record: '记录',
            fieldDate: '日期',
            date: '请选择日期',
            dateTime: '请选择日期/时间',
            bool: 'bool值'
          }
        },
        resourceCreate: {
          flowType: '资源类型',
          name: '资源名称',
          description: '描述',
          type: '数据类型',
          valueType: '集合',
          valueTypeOption: {
            array: '允许多个值（集合）'
          },
          refObjectId: '对象',
          defaultValue: '默认值',
          text: '模板',
          expression: '公式',
          addResource: '添加资源'
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
            time: '恢复特定时间',
            recordTime: '恢复记录时间'
          },
          rule: {
            name: '暂停配置标题',
            sourceTime: '时间源',
            registerId: '获取对象记录',
            field: '字段',
            recordIdValue: '记录',
            dateValue: '基本时间',
            offsetNum: '偏移数字',
            offsetUnit: '偏移单位（小时或天数）',
          },
          outputParameters: '在变量中存储输出值',
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
        },
        recordCreate: {
          addTitle: '新建创建记录',
          editTitle: '编辑创建记录',
          removeTitle: '删除创建记录',
          setting: '设置',
          setField: '的字段值',
          saveId: '在变量中存储',
          registerId: '对象记录',
          inputAssignments: '设置字段值',
          storeOutputAutomatically: '手动分配变量',
          assignRecordIdToReference: '变量'
        },
        recordRemove: {
          addTitle: '新建删除记录',
          editTitle: '编辑删除记录',
          removeTitle: '删除删除记录',
          registerId: '对象记录',
          conditions: '筛选记录',
        },
        recordUpdate: {
          addTitle: '新建更新记录',
          editTitle: '编辑更新记录',
          removeTitle: '删除更新记录',
          filter: '筛选',
          record: '记录',
          setting: '设置',
          setField: '的字段值',
          registerId: '对象记录',
          conditions: '筛选记录',
          inputAssignments: '设置字段值',
        },
        recordLookUp: {
          addTitle: '新建获取记录',
          editTitle: '编辑获取记录',
          removeTitle: '删除获取记录',
          filter: '筛选',
          record: '记录',
          registerId: '对象记录',
          conditions: '筛选记录',
          sortOrder: '排序记录',
          sortOrderOption: {
            asc: '升序',
            desc: '降序',
            no: '未排序'
          },
          sortField: '排序标准',
          getFirstRecordOnly: '存储的记录数量',
          getFirstRecordOnlyOp: {
            first: '仅限第一个记录',
            all: '所有记录'
          },
          storeOutputAutomatically: '如何存储记录数据',
          storeOutputAutomaticallyOp: {
            auto: '自动存储所有字段',
            people: '手动存储所有字段'
          },
          automaticallyType: '手动存储类型',
          automaticallyTypeOp: {
            select: '选择字段',
            selectPro: '选择字段并分配变量（高级）'
          },
          address: '存储字段值的位置',
          addressOption: {
            comm: '共同在记录变量中',
            one: '在单独变量中'
          },
          outputReference: '选择记录变量',
          outputReferenceLabel: '记录（单个）变量',
          queriedFields: '选择指定id字段',
          addField: '添加字段',
          outputAssignments: '设置字段',
          textTemplate: '如果您仅存储第一个记录，按唯一字段筛选，例如 ID。'
        },
        formula: {
          editTitle: '编辑公式',
          formulaEditorTitle: 'meta公式型字段'
        },
        template: {
          customTitle: '可选字段'
        }
      }
    }
  }
})

GlobalRegistry.setDesignerLanguage('zh-CN')

initData()
getFlowData('6165263cea6c7b2123d59061').then(({data}) => {
  console.log(data, 'getFlowData()')
})

export default () => {
  const [flowMeta, setFlowMeta] = useState({
    id: 'flow-meta-1',
    name: 'flow',
    flow: flow,
  })
  useEffect(() => {
    const href = window.location.href
    const flowId = href.split('?flowId=')[1]
    if (flowId) {
      getFlowModelData(flowId).then(({data}) => {
        console.log(1111111111111111, 22222222222)
        setFlowMeta({
          id: 'flow-meta-1',
          name: 'flow',
          flow: data.flows || flow,
        })
      })
    }
    getmetaObjectData().then(({data}) => {
      console.log(data)
    })
  }, [])
  return (
    <DesignerContext.Provider value={{ prefix: 'fd', GlobalRegistry }}>
      <Navbar />
      <FlowEditor flowMeta={flowMeta} />
    </DesignerContext.Provider>
  );
};
```
