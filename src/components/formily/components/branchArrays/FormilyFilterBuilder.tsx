import React, { FC, useState, useCallback } from 'react';
import { FilterBuilder } from '@toy-box/meta-components';
import { ResourceCreate } from '../../../form-model/ResourceCreate'
import { fieldMetaStore } from '../../../../store'
import { ICompareOperation } from '@toy-box/meta-schema'
import update from 'immutability-helper'
import { useForm } from '@formily/react'
import { observer } from '@formily/reactive-react'

interface FormilyFilterBuilderProps {
  selectIndex: number
}
export const FormilyFilterBuilder: FC<FormilyFilterBuilderProps> = observer(({
  selectIndex = 0
}) => {
  const { fieldMetas, updateFieldMetas, fieldServices } = fieldMetaStore.fieldMetaStore
  const form = useForm()
  const rule = form.values.rules[selectIndex]
  const conditions = rule?.criteria?.conditions
  const [value, setValue] = useState(conditions)
  const prefixCls = 'formily-filter'

  const submitResource = useCallback(
    (resourceData) => {
      const metas = update(fieldMetas, { $push: [resourceData] })
      updateFieldMetas(metas)
    },
    [fieldMetas, updateFieldMetas]
  )

  const handleFilter = useCallback(
    (logicFilter) => {
      setValue(logicFilter)
      form.setFieldState('rules', (state: any) => {
        if (state.value[selectIndex]?.criteria?.conditions) state.value[selectIndex].criteria.conditions = logicFilter
      })
    },
    [form, selectIndex]
  )

  const specialOptions = [
    {
      label: '引用变量',
      value: 'REFERENCE',
    },
    {
      label: '直接输入',
      value: 'INPUT',
    },
  ]

  return (
    <div>
      <div className={`${prefixCls}-content-resource`}>
        <ResourceCreate 
          submit={submitResource}
          fieldMetas={fieldMetas as any[]}
        />
      </div>
      <div className={`${prefixCls}-content-filter`}>
      <FilterBuilder
          fieldMetas={fieldMetas}
          value={value as any[]}
          filterFieldService={fieldServices}
          specialOptions={specialOptions}
          specialMode
          onChange={(filterItem: Partial<ICompareOperation>[]) =>
            handleFilter(filterItem)
          }
        />
      </div>
    </div>
  )
})
