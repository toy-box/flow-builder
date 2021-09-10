import React, { FC, useCallback, useMemo } from 'react'
import { Input } from '@formily/antd'
import { MetaValueType } from '@toy-box/meta-schema';
import { useForm, observer } from '@formily/react'
import { FieldDate, FieldBoolean, FieldSelect } from '@toy-box/meta-components';
import { isArr } from '@formily/shared';
import { fieldMetaStore } from '../../../store'



export const GatherInput: FC = observer((props: any) => {
  const form = useForm()
  const { registers } = fieldMetaStore.fieldMetaStore;

  const changeValue = useCallback((e) => {
    form.setFieldState('defaultValue', (state) => {
      state.value = e.target.value
    })
  }, [form])

  const changeDate = useCallback((value) => {
    form.setFieldState('defaultValue', (state) => {
      state.value = value
    })
  }, [form])

  const handleSelectOptions = useCallback((value) => {
    form.setFieldState('refObjectId', (state) => {
      state.value = value
    })
  }, [form])

  const registerOptions = useMemo(() => {
    if (isArr(registers)) {
      const options = registers.map((r) => {
        return {
          label: r.name,
          value: r.id,
        }
      })
      return options
    }
    return []
  }, [registers])

  const filterValueInput = useMemo(() => {
    switch (form.values.type) {
      case MetaValueType.TEXT:
      case MetaValueType.STRING:
      case MetaValueType.NUMBER:
        return <Input placeholder="请输入值" type={form.values.type} onChange={changeValue} value={props.value} />
      case MetaValueType.OBJECT_ID:
        return <FieldSelect
                placeholder='请选择值'
                options={registerOptions}
                field={
                  {
                    type: form.values.type,
                    key: form.values.type,
                    name: '记录',
                  }
                }
                value={props.value}
                onChange={handleSelectOptions}
              />
      case MetaValueType.DATE:
      case MetaValueType.DATETIME:
        return <FieldDate
                  value={props.value}
                  mode={'edit'}
                  field={{
                    type: form.values.type,
                    key: form.values.type,
                    name: '日期',
                  }}
                  placeholder={`${form.values.type === MetaValueType.DATE ? '请选择日期' : '请选择日期/时间'}`}
                  onChange={changeDate}
                />
      case MetaValueType.BOOLEAN:
        return <FieldBoolean
                  value={props.value}
                  field={{
                    type: form.values.type,
                    key: 'boolean',
                    name: 'bool值'
                  }}
                  onChange={changeDate}
                />
      default:
        return null
    }
  }, [form.values.type, changeValue, props.value, registerOptions, handleSelectOptions, changeDate])
  return (
    <div>
      { filterValueInput }
    </div>
  )
})