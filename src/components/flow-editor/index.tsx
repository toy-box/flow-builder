import React, { FC, useEffect } from 'react'
import { FlowChart, ListUnordered } from '@airclass/icons'
import { AntvCanvas } from './components'
import { FlowGraphMeta } from '../../flow/types'
import { FlowContext } from '../../flow/shared'
import { AutoFlow } from '../../flow/models/AutoFlow'
import { fieldMetaStore } from '../../store'
import { CompositePanel } from '../composite-panel'
import { usePrefix } from '../../hooks'

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
      label: '变量',
      value: 'variable',
      children: [
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
      ]
    }
  ],

  filterFieldService: {
    findOptions: (key: any, name: any) => findOptions(key, name),
    findOfValues: (key: any, value: any) => findOfValues(key, value),
    findDataTrees: (key: any, parentId: any) => findDataTrees(key, parentId),
  },
}

const registers = [{
  "key": "test_mongoxx44",
  "name": "测试-新增mongo表xx44",
  "description": null,
  "type": "mongodb",
  "properties": {
    "cate": {
      "key": "cate",
      "name": "类型",
      "description": null,
      "type": "string",
      "properties": null,
      "items": null,
      "primary": false,
      "options": null,
      "refObjectId": null,
      "unique": false,
      "required": true,
      "precision": null,
      "roundingMode": "HALF_UP",
      "maximum": null,
      "minimum": null,
      "exclusiveMaximum": null,
      "exclusiveMinimum": null,
      "maxLength": 50,
      "minLength": null,
      "minItems": null,
      "maxItems": null,
      "pattern": null,
      "format": null,
      "titleKey": null,
      "parentKey": null,
      "multipleOf": null,
      "minProperties": null,
      "maxProperties": null,
      "id": "064b4848da3d11ebb988fa163e78d0b8",
      "registerId": "432df637cf294ce79d4a7452cd9abd89"
    },
    "name": {
      "key": "name",
      "name": "名称",
      "description": null,
      "type": "string",
      "properties": null,
      "items": null,
      "primary": false,
      "options": null,
      "refObjectId": null,
      "unique": false,
      "required": false,
      "precision": null,
      "roundingMode": "HALF_UP",
      "maximum": null,
      "minimum": null,
      "exclusiveMaximum": null,
      "exclusiveMinimum": null,
      "maxLength": 50,
      "minLength": null,
      "minItems": null,
      "maxItems": null,
      "pattern": null,
      "format": null,
      "titleKey": null,
      "parentKey": null,
      "multipleOf": null,
      "minProperties": null,
      "maxProperties": null,
      "id": "064b4837da3d11ebb988fa163e78d0b8",
      "registerId": "432df637cf294ce79d4a7452cd9abd89"
    },
    "updateAt": {
      "key": "updateAt",
      "name": "修改时间",
      "description": "修改时间",
      "type": "datetime",
      "properties": null,
      "items": null,
      "primary": false,
      "options": null,
      "refObjectId": null,
      "unique": false,
      "required": true,
      "precision": null,
      "roundingMode": "HALF_UP",
      "maximum": null,
      "minimum": null,
      "exclusiveMaximum": null,
      "exclusiveMinimum": null,
      "maxLength": 0,
      "minLength": null,
      "minItems": null,
      "maxItems": null,
      "pattern": null,
      "format": null,
      "titleKey": null,
      "parentKey": null,
      "multipleOf": null,
      "minProperties": null,
      "maxProperties": null,
      "id": "064b485fda3d11ebb988fa163e78d0b8",
      "registerId": "432df637cf294ce79d4a7452cd9abd89"
    },
    "id": {
      "key": "id",
      "name": "ID",
      "description": "ID",
      "type": "objectId",
      "properties": null,
      "items": null,
      "primary": true,
      "options": null,
      "refObjectId": null,
      "unique": false,
      "required": true,
      "precision": null,
      "roundingMode": "HALF_UP",
      "maximum": null,
      "minimum": null,
      "exclusiveMaximum": null,
      "exclusiveMinimum": null,
      "maxLength": 50,
      "minLength": null,
      "minItems": null,
      "maxItems": null,
      "pattern": null,
      "format": null,
      "titleKey": null,
      "parentKey": null,
      "multipleOf": null,
      "minProperties": null,
      "maxProperties": null,
      "id": "064b480eda3d11ebb988fa163e78d0b8",
      "registerId": "432df637cf294ce79d4a7452cd9abd89"
    },
    "createAt": {
      "key": "createAt",
      "name": "创建时间",
      "description": "创建时间",
      "type": "datetime",
      "properties": null,
      "items": null,
      "primary": false,
      "options": null,
      "refObjectId": null,
      "unique": false,
      "required": true,
      "precision": null,
      "roundingMode": "HALF_UP",
      "maximum": null,
      "minimum": null,
      "exclusiveMaximum": null,
      "exclusiveMinimum": null,
      "maxLength": 0,
      "minLength": null,
      "minItems": null,
      "maxItems": null,
      "pattern": null,
      "format": null,
      "titleKey": null,
      "parentKey": null,
      "multipleOf": null,
      "minProperties": null,
      "maxProperties": null,
      "id": "064b4855da3d11ebb988fa163e78d0b8",
      "registerId": "432df637cf294ce79d4a7452cd9abd89"
    }
  },
  "items": null,
  "titleKey": "1",
  "parentKey": null,
  "tenantKey": null,
  "primaryKey": "id",
  "createdKey": "createAt",
  "updatedKey": "updateAt",
  "id": "432df637cf294ce79d4a7452cd9abd89",
  "httpBase": null,
  "database": "meta",
  "state": "1",
  "tenantId": "0",
  "createdAt": "2021-07-01T15:21:42.000+0800",
  "updatedAt": "2021-07-01T15:21:42.000+0800"
}]

export const FlowEditor: FC<{ flowMeta: FlowGraphMeta }> = ({ flowMeta }) => {
  const prefixCls = usePrefix('-editor')
  const flowGraph = new AutoFlow(flowMeta)
  const { initFieldMetas, initFieldServices, initRegisters} = fieldMetaStore.fieldMetaStore

  useEffect(() => {
    initFieldMetas(filter.filterFieldMetas as any)
    initFieldServices(filter.filterFieldService)
    initRegisters(registers);
  }, [initFieldMetas, initFieldServices, initRegisters])

  return (
    <div className={prefixCls}>
      <CompositePanel>
        <CompositePanel.Item title="panels.Flow" icon={<FlowChart />}>
          FlowChart
        </CompositePanel.Item>
        <CompositePanel.Item title="panels.Data" icon={<ListUnordered />}>
          Resource
        </CompositePanel.Item>
      </CompositePanel>
      <FlowContext.Provider value={flowGraph}>
        <AntvCanvas />
      </FlowContext.Provider>
    </div>
  )
}
