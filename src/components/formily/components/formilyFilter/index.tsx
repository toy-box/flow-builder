import React, { FC, useCallback, useState, useMemo } from 'react'
import { useForm, observer, useField } from '@formily/react'
import { FilterBuilder } from '@toy-box/meta-components';
import { ICompareOperation, IFieldOption, IFieldGroupMeta } from '@toy-box/meta-schema'
import { fieldMetaStore } from '../../../../store'
import { ResourceCreate } from '../../../form-model/ResourceCreate'
import { useLocale } from '../../../../hooks'
import { isArr } from '@toy-box/toybox-shared';

export const FormilyFilter: FC = observer((props: any) => {
  const { registers } = fieldMetaStore.fieldMetaStore
  const form = useForm()
  const formilyField = useField() as any
  const handleFilter = useCallback(
    (value) => {
      form.setFieldState(formilyField?.path?.entire, (state) => {
        state.value = value
        formilyField.validate()
      })
    },
    [form, formilyField],
  )
  const specialOptions = useMemo(() => {
    const arr = [
      {
        label: useLocale('flow.form.comm.reference'),
        value: 'REFERENCE',
      },
      {
        label: useLocale('flow.form.comm.input'),
        value: 'INPUT',
      },
    ]
    const list = arr.filter((p) => {
      if (isArr(props.specialShowTypes)) {
        return props.specialShowTypes.find((type: string) => type === p.value)
      } else {
        return true
      }
    })
    return list
  }, [props.specialShowTypes])

  const resourceFieldMetas = useMemo(() => {
    if (props.mataSource === 'metaData') {
      const reactionKey = form.values[props.reactionKey]
      let registerOps: IFieldOption[] = []
      registers.some((re) => {
        if (re.id === reactionKey) {
          for (const key in re.properties) {
            if (re.properties.hasOwnProperty(key)) {
              const obj = re.properties[key];
              props.flowGraph?.fieldMetas.forEach((meta: IFieldGroupMeta) => {
                meta?.children.forEach((child) => {
                  if (child.type === obj.type) obj.options = child.options
                })
              })
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
  }, [form.values, props.mataSource, props.reactionKey, registers, props.flowGraph.fieldMetas, form.values[props.reactionKey]])
  return (
    <div style={{'display': props.display}}>
      {props.isShowResourceBtn && <ResourceCreate 
        fieldMetas={props.flowGraph.fieldMetas as any[]}
        flowGraph={props.flowGraph}
      />}
      <FilterBuilder
        fieldMetas={resourceFieldMetas as any[]}
        value={formilyField.value as any[]}
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