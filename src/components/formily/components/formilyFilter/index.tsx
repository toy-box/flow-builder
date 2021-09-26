import React, { FC, useCallback, useState, useMemo } from 'react'
import { useForm, observer, useField } from '@formily/react'
import { FilterBuilder } from '@toy-box/meta-components';
import { ICompareOperation, IFieldOption } from '@toy-box/meta-schema'
import { fieldMetaStore } from '../../../../store'
import { ResourceCreate } from '../../../form-model/ResourceCreate'
import { useLocale } from '../../../../hooks'

export const FormilyFilter: FC = observer((props: any) => {
  const { registers } = fieldMetaStore.fieldMetaStore
  const form = useForm()
  const formilyField = useField() as any
  const handleFilter = useCallback(
    (value) => {
      setValue(value)
      form.setFieldState(formilyField?.path?.entire, (state) => {
        state.value = value
        formilyField.validate()
      })
    },
    [form, formilyField],
  )
  const specialOptions = [
    {
      label: useLocale('flow.form.comm.reference'),
      value: 'REFERENCE',
    },
    {
      label: useLocale('flow.form.comm.input'),
      value: 'INPUT',
    },
  ]

  const [value, setValue] = useState(formilyField.value)

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
    return props.flowGraph.fieldMetas
  }, [form.values, props.mataSource, props.reactionKey, registers, props.flowGraph.fieldMetas])
  return (
    <div style={{'display': props.display}}>
      {props.isShowResourceBtn && <ResourceCreate 
        fieldMetas={props.flowGraph.fieldMetas as any[]}
        flowGraph={props.flowGraph}
      />}
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