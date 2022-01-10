import React, { FC, useCallback, useMemo, useState } from 'react'
import { useForm, observer, useField } from '@formily/react'
import { FilterBuilder } from '@toy-box/meta-components';
import { ICompareOperation, IFieldOption, IFieldGroupMeta } from '@toy-box/meta-schema'
import { ResourceCreate } from '../../../form-model/ResourceCreate'
import { useLocale } from '../../../../hooks'
import { isArr } from '@toy-box/toybox-shared';
import { CustomValueElement } from './CustomValueElement'

export const FormilyFilter: FC = observer((props: any) => {
  const [idx, setIndex] = useState(-1)
  const form = useForm()
  const formilyField = useField() as any
  const handleFilter = useCallback(
    (value, index) => {
      setIndex(index)
      form.setFieldState(formilyField?.path?.entire, (state) => {
        state.value = value
        formilyField.validate()
      })
    },
    [form, formilyField],
  )
  const specialOptions = useMemo(() => {
    const arr = [
      // {
      //   label: useLocale('flow.form.comm.reference'),
      //   value: 'REFERENCE',
      // },
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
      props.flowGraph.registers.some((re: { id: any; properties: { [x: string]: any; hasOwnProperty: (arg0: string) => any; }; }) => {
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
    const resourceFieldMetas = props.flowGraph.fieldMetas as any[]
    let metas = resourceFieldMetas;
    if (isArr(props.flowJsonTypes)) {
      metas = []
      props.flowJsonTypes.forEach((op: any) => {
        if (isArr(op.children)) {
          const meta = resourceFieldMetas.find((meta: any) => op.value === meta.value)
          const children = meta?.children.filter((child: any) => {
            if (props.operatType) {
              const operatOptions = props?.operatOptions.find((option: any) => child.webType === option.type)
              if (operatOptions && operatOptions?.children.length > 0) {
                const option = operatOptions.find((option: any) => child.type === option.type)
                if (option && option?.children) child.operatOptions = option?.children
              }
            }
            const opIdx = op?.children.findIndex((type: string) => child.webType === type)
            return opIdx > -1 ? child : undefined
          })
          if (children) {
            metas.push({
              label: op.label || meta.label,
              value: op.value || meta.value,
              children,
            })
          }
        } else {
          const meta = resourceFieldMetas.find((meta: any) => op.value === meta.value)
          const children = meta?.children.filter((child: any) => {
            if (props.operatType) {
              const operatOptions = props?.operatOptions.find((option: any) => child.webType === option.type)
              if (operatOptions && operatOptions?.children.length > 0) {
                const option = operatOptions?.children.find((option: any) => child.type === option.type)
                if (option && option?.children) child.operatOptions = option?.children
              }
            }
            return child
          })
          if (meta) {
            meta.children = children
            metas.push(meta)
          }
        }
      })
    }
    return metas
  }, [props.mataSource, props.flowGraph.fieldMetas, props.flowJsonTypes, props.reactionKey, props.operatType, form.values, props.flowGraph.registers])

  const changeFormaluValue = useCallback(
    (value, index) => {
      debugger
      formilyField.value[index].target = value
    },
    [formilyField.value],
  )
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
        operatType={props.operatType}
        customValueElement={CustomValueElement}
        customValueProps={{
          flowGraph: props.flowGraph,
          value: formilyField.value,
          resourceFieldMetas: resourceFieldMetas,
          onChange: (value: string, index: number) => changeFormaluValue(value, index)
        }}
        onChange={(filterItem: Partial<ICompareOperation>[], index?: number) =>
          handleFilter(filterItem, index)
        }
        simple={props.simple}
      />
    </div>
  )
})

function value(value: any) {
  throw new Error('Function not implemented.');
}
