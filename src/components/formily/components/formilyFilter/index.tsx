import React, { FC, useCallback, useState, useMemo } from 'react'
import { useForm, observer } from '@formily/react'
import { FilterBuilder } from '@toy-box/meta-components';
import { ICompareOperation, IFieldOption } from '@toy-box/meta-schema'
import { fieldMetaStore } from '../../../../store'

export const FormilyFilter: FC = observer((props: any) => {
  const { fieldMetas, registers } = fieldMetaStore.fieldMetaStore
  const form = useForm()
  const handleFilter = useCallback(
    (value) => {
      setValue(value)
      form.setFieldState(props.paramKey, (state) => {
        state.value = value
      })
    },
    [form, props.paramKey],
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

  const [value, setValue] = useState([])

  const resourceFieldMetas = useMemo(() => {
    if (props.mataSource === 'metaData') {
      const reactionKey = form.values[props.reactionKey]
      let registerOps: IFieldOption[] = []
      registers.some((re) => {
        if (re.id === reactionKey) {
          for (const key in re.properties) {
            if (re.properties.hasOwnProperty(key)) {
              const obj = re.properties[key];
              registerOps.push(obj)
            }
          }
          return true
        }
        return false
      })
      return registerOps
    }
    return fieldMetas
  }, [fieldMetas, form.values, props.mataSource, props.reactionKey, registers])
  return (
    <div style={{'display': props.display}}>
      <FilterBuilder
        fieldMetas={resourceFieldMetas as any[]}
        value={value as any[]}
        specialOptions={specialOptions}
        specialMode={props.specialMode}
        onChange={(filterItem: Partial<ICompareOperation>[]) =>
          handleFilter(filterItem)
        }
        simple={props.simple}
      />
    </div>
  )
})