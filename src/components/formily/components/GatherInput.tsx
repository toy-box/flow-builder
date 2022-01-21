import React, { FC, useCallback, useMemo } from 'react'
import { Input } from '@formily/antd'
import { Input as antInput } from 'antd'
import { MetaValueType } from '@toy-box/meta-schema';
import { useForm, observer } from '@formily/react'
import { FieldDate, FieldBoolean, FieldSelect } from '@toy-box/meta-components';
import { isArr } from '@formily/shared';
import { useLocale } from '../../../hooks'



export const GatherInput: FC = observer((props: any) => {
  const form = useForm()
  const { TextArea } = antInput

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
    if (isArr(props.flowGraph.registers)) {
      const options = props.flowGraph.registers.map((r: { name: any; id: any; }) => {
        return {
          label: r.name,
          value: r.id,
        }
      })
      return options
    }
    return []
  }, [props.flowGraph.registers])

  const filterValueInput = useMemo(() => {
    switch (form.values.type) {
      case MetaValueType.TEXT:
        return <TextArea
          onChange={changeValue} 
          value={props.value}
          placeholder={useLocale('flow.form.placeholder.formilyInput.input')}
          autoSize={{ minRows: 3, maxRows: 5 }}
        />
      case MetaValueType.STRING:
      case MetaValueType.NUMBER:
        return <Input placeholder={useLocale('flow.form.placeholder.formilyInput.input')} type={form.values.type} onChange={changeValue} value={props.value} />
      case MetaValueType.OBJECT:
        return <FieldSelect
                placeholder={useLocale('flow.form.placeholder.formilyInput.select')}
                options={registerOptions}
                field={
                  {
                    type: form.values.type,
                    key: form.values.type,
                    name: useLocale('flow.form.placeholder.formilyInput.record'),
                  }
                }
                disabled={props.disabled}
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
                    name: useLocale('flow.form.placeholder.formilyInput.fieldDate'),
                  }}
                  placeholder={`${form.values.type === MetaValueType.DATE ?
                    useLocale('flow.form.placeholder.formilyInput.date') : useLocale('flow.form.placeholder.formilyInput.dateTime')}`}
                  onChange={changeDate}
                />
      case MetaValueType.BOOLEAN:
        return <FieldBoolean
                  value={props.value}
                  field={{
                    type: form.values.type,
                    key: 'boolean',
                    name: useLocale('flow.form.placeholder.formilyInput.bool')
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