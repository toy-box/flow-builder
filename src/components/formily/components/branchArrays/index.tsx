import React, { FC, useState, useCallback, useEffect } from 'react';
import update from 'immutability-helper'
import classnames from 'classnames'
import { ISchema  } from '@formily/json-schema'
import { Button } from 'antd';
import {
  PlusOutlined,
} from '@ant-design/icons';
import { IRuleItem } from '../../../form-model/interface'
import './index.less'
import { useForm, observer, useField, useFieldSchema, RecursionField } from '@formily/react'
import { uid } from '../../../../utils';
import { ArrayBase } from './ArrayBase'


const isAdditionComponent = (schema: ISchema) => {
  return schema['x-component']?.indexOf('Addition') > -1
}

const isIndexComponent = (schema: ISchema) => {
  return schema['x-component']?.indexOf('Index') > -1
}

const isOperationComponent = (schema: ISchema) => {
  return (
    isAdditionComponent(schema)
  )
}

export const BranchArrays: FC = observer((props: any) => {
  const form = useForm()
  const field = useField<Formily.Core.Models.ArrayField>()
  const schema = useFieldSchema()
  const dataSource = Array.isArray(field.value) ? field.value : []
  const [selectIndex, setSelectIndex] = useState(0)
  const prefixCls = 'branch-arrays'

  const renderItems = () => {
    return dataSource?.map((item, index: number) => {
      const items = Array.isArray(schema.items)
        ? schema.items[index] || schema.items[0]
        : schema.items
      let removeTip = ''
      items?.mapProperties((schema1, name) => {
        removeTip = schema1['x-component-props'].removeMessage || '删除'
      })
      const content = (
        <RecursionField
          schema={items as any}
          name={index}
          filterProperties={(schema) => {
            if (isIndexComponent(schema)) return false
            if (isOperationComponent(schema)) return false
            return true
          }}
        />
      )
      return (
        <ArrayBase.Item key={index} index={index}>
          { index === selectIndex ? <div className={`${prefixCls}-content-right`}>
            <div>
              {dataSource.length > 1 && <div className={`${prefixCls}-remove-btn`}>
                <Button onClick={handleRemove}>{removeTip}</Button>
              </div>}
              {content}
            </div>
            </div>
            : null}
        </ArrayBase.Item>
      )
    })
  }

  const handleRemove = useCallback(
    () => {
      // form.setFieldState('rules', (state) => {
      //   state.value = update(state.value, { $splice: [[selectIndex, 1]] })
      // })
      field.remove(selectIndex)
      setSelectIndex(selectIndex - 1 < 0 ? selectIndex : selectIndex - 1)
    },[field, form, selectIndex]
  )

  const selectValue = useCallback(
    (value) => {
      setSelectIndex(value)
    },
    [],
  )

  const renderContent = () => {
    return <div className={prefixCls}>
      {props.descTipHtml}
      <div className={`${prefixCls}-content`}>
          <div className={`${prefixCls}-content-left`}>
            <div className={`${prefixCls}-content-left-top`}>
              <div className="left-title">
                <span>{props.addDescription}</span>
                {renderAddition()}
              </div>
            </div>
            <div className={`${prefixCls}-content-left-body`}>
              {
                dataSource?.map((item, index) => 
                  <div
                    key={index} 
                    onClick={() => selectValue(index)}
                    className={classnames(`${prefixCls}-content-item`, dataSource?.[selectIndex]?.id === item.id ? 'active' : '')}>
                    {item.name || props.title}
                  </div>
                )
              }
            </div>
          </div>
          {renderItems()}
      </div>
    </div>
  }
  const addRule = useCallback(
    () => {
      const ruleItem: IRuleItem = {
        name: '',
        id: uid(),
        criteria: {
          conditions: [{}],
        },
        description: '',
      }
      form.setFieldState('rules', (state) => {
        state.value = update(state.value, { $push: [ruleItem] })
      })
    },
    [form],
  )

  const renderAddition = () => {
    return <Button size="small" onClick={addRule} icon={<PlusOutlined />}></Button>
  }

  return (
    // <ArrayBase>
    <div>
      {renderContent()}
    </div>
    // </ArrayBase>
  )
})

ArrayBase.mixin(BranchArrays)