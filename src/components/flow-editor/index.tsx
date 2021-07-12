import React, { FC, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { FlowCanvas, FlowContainer } from './components'
import { FlowGraphMeta } from '../../flow/types'
import { FlowContext } from '../../flow/shared'
import { FlowGraph } from '../../flow/models/FlowGraph'
import ToolBar from '../tool-bar'
import { fieldMetaStore } from '../../store'

import './styles'

const serviceTest = async function (resolve: { (value: unknown): void; (value: unknown): void; (value: unknown): void; (arg0: any): void; }, key: string) {
  setTimeout(() => {
    resolve(key)
  }, 100)
}

function findOptions(key: any, name: any) {
  return new Promise((resolve) => {
    serviceTest(resolve, key)
  }).then((res) => {
    return [
      {
        label: 'SIX',
        value: '123',
      },
      {
        label: 'named',
        value: '456',
      },
    ]
  })
}

function findOfValues(key: string, value: any) {
  return new Promise((resolve) => {
    serviceTest(resolve, key)
  }).then((res) => {
    if (key === 'deptId')
      return [{ id: '2', value: '1', title: 'Expand to load2' }]
    return [
      {
        label: 'SIX',
        value: '123',
      },
      {
        label: 'named',
        value: '456',
      },
    ]
  })
}

function findDataTrees(key: any, parentId: string) {
  return new Promise((resolve) => {
    serviceTest(resolve, key)
  }).then((res) => {
    if (parentId === '2')
      return [{ id: '3', pId: '2', value: '3', title: 'Expand to load3' }]
    if (parentId)
      return [{ id: '2', pId: '1', value: '2', title: 'Expand to load2' }]
    return [{ id: '1', pId: 0, value: '1', title: 'Expand to load' }]
  })
}

const filter = {
  filterFieldMetas: [
    {
      description: null,
      exclusiveMaximum: null,
      exclusiveMinimum: null,
      format: null,
      key: 'deptId',
      maxLength: null,
      maximum: null,
      minLength: null,
      minimum: null,
      name: '部门',
      options: null,
      parentKey: 'parent_id',
      pattern: null,
      primary: null,
      properties: null,
      refObjectId: '5f9630d977b9ec42e4d0dca5',
      required: null,
      titleKey: 'name',
      type: 'objectId',
      unique: null,
      unBasic: true,
    },
    {
      description: null,
      exclusiveMaximum: null,
      exclusiveMinimum: null,
      format: null,
      key: 'date',
      maxLength: null,
      maximum: null,
      minLength: null,
      minimum: null,
      name: '日期',
      options: null,
      pattern: null,
      primary: null,
      properties: null,
      required: null,
      type: 'date',
    },
    {
      description: null,
      exclusiveMaximum: null,
      exclusiveMinimum: null,
      format: null,
      key: 'copId',
      maxLength: null,
      maximum: null,
      minLength: null,
      minimum: null,
      name: '公司',
      options: [
        {
          label: '12323232',
          value: '1',
        },
        {
          label: 'bbbbbbb',
          value: '2',
        },
      ],
      pattern: null,
      primary: null,
      properties: null,
      refObjectId: '5f9630d977b9ec42e4d0dca5',
      required: null,
      titleKey: 'name',
      type: 'singleOption',
      unique: null,
      unBasic: true,
    },
  ],

  filterFieldService: {
    findOptions: (key: any, name: any) => findOptions(key, name),
    findOfValues: (key: any, value: any) => findOfValues(key, value),
    findDataTrees: (key: any, parentId: any) => findDataTrees(key, parentId),
  },
}

const FlowEditor: FC<{ flowMeta: FlowGraphMeta }> = ({ flowMeta }) => {
  const prefixCls = 'flow-editor'
  const flowGraph = new FlowGraph(flowMeta)
  const { initFieldMetas, initFieldServices} = fieldMetaStore.fieldMetaStore

  useEffect(() => {
    initFieldMetas(filter.filterFieldMetas as any)
    initFieldServices(filter.filterFieldService)
  }, [initFieldMetas, initFieldServices])

  return (
    <div className={prefixCls}>
      <DndProvider backend={HTML5Backend}>
        <ToolBar />
        <FlowContext.Provider value={flowGraph}>
          <FlowContainer>
            <FlowCanvas />
          </FlowContainer>
        </FlowContext.Provider>
      </DndProvider>
    </div>
  )
}

export default FlowEditor
