import React, { FC, useCallback, useEffect, useState } from 'react'
import { FlowChart, ListUnordered } from '@airclass/icons'
import { AntvCanvas } from './components'
import { FlowGraphMeta } from '../../flow/types'
import { FlowContext } from '../../flow/shared'
import { AutoFlow } from '../../flow/models/AutoFlow'
import { fieldMetaStore } from '../../store'
import { CompositePanel } from '../composite-panel'
import { usePrefix } from '../../hooks'

import './styles'
import { NodeWidget } from '../node-widget'
import * as MetaObjectService from '../../services/metaObject.service'
import { SaveInfoModel } from './SaveInfoModel'

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
    MetaObjectService.metaObjectData().then(({data}) => {
      initRegisters(data);
    })
  }, [initFieldMetas, initFieldServices, initRegisters])

  return (
    <div className={prefixCls}>
      <div className={`${prefixCls}-narbar`}>
        {<SaveInfoModel flowGraph={flowGraph}></SaveInfoModel>}
      </div>
      <div className={`${prefixCls}-content`}>
        <FlowContext.Provider value={flowGraph}>
          <CompositePanel>
            <CompositePanel.Item title="panels.Flow" icon={<FlowChart />}>
              <NodeWidget />
            </CompositePanel.Item>
            <CompositePanel.Item title="panels.Data" icon={<ListUnordered />}>
              Resource
            </CompositePanel.Item>
          </CompositePanel>
          <AntvCanvas />
        </FlowContext.Provider>
      </div>
    </div>
  )
}
