import React, { FC, useCallback, useMemo } from 'react'
import { useForm, observer, useField } from '@formily/react'
import { Select } from 'antd'
import { isArr } from '@formily/shared'
import { IFieldOption, MetaValueType } from '@toy-box/meta-schema'
import { ResourceCreate } from '../../../form-model/ResourceCreate'
import { useLocale } from '../../../../hooks'


const { OptGroup, Option } = Select

export interface IFieldOptionProp {
  label: string
  value: string
}
export interface IOptionProp extends IFieldOptionProp {
  type: MetaValueType
  children?: IFieldOptionProp[]
}

export const ResourceSelect: FC = observer((props: any) => {

  const form = useForm()
  const formilyField = useField() as any

  const metaOptions = useMemo(() => {
    if (props.mataSource === 'metaData') {
      if (props.reactionKey) {
        const reactionKey = form.values[props.reactionKey]
        let registerOps: IFieldOption[] = []
        props.flowGraph.registers?.some((re: { id: any; properties: { [x: string]: any; hasOwnProperty: (arg0: string) => any } }) => {
          if (re.id === reactionKey) {
            for (const key in re.properties) {
              if (re.properties.hasOwnProperty(key)) {
                const obj = re.properties[key]
                const option = {
                  label: obj.name,
                  value: obj.key,
                }
                registerOps.push(option)
              }
            }
            return true
          }
          return false
        })
        return registerOps
      }
      const options = props.flowGraph.registers?.map((r: { name: any; id: any }) => {
        return {
          label: r.name,
          value: r.id,
        }
      })
      return options
    }
    const resourceFieldMetas = props.flowGraph.fieldMetas as any[]
    let metas = resourceFieldMetas;
    if (isArr(props.flowJsonTypes)) {
      metas = []
      props.flowJsonTypes.forEach((op: any) => {
        if (isArr(op.children)) {
          const meta = resourceFieldMetas.find((meta: any) => op.value === meta.value)
          const children = meta?.children.filter((child: any) => {
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
          if (meta) metas.push(meta)
        }
      })
    }
    return metas.map((field: any) => {
      if (field?.children) {
        const children = field?.children.map((child: any) => ({
          label: child?.name,
          value: child?.key,
          type: child.type,
        }))
        return {
          label: field?.label,
          value: field?.value,
          children,
        }
      } else {
        return {
          label: field?.name,
          value: field?.key,
          type: field.type,
        }
      }
    })
  }, [props.flowGraph.fieldMetas, form.values, props.mataSource, props.reactionKey, props.flowJsonTypes, props.flowGraph.registers, form.values[props.reactionKey]])

  const metaTypeOps = useMemo(() => {
    const ops: IOptionProp[] = []
    if (props.metaTypes) {
      metaOptions.forEach((op: IOptionProp) => {
        if (op.children) {
          const childs: any[] = op.children.filter((cld: any) => {
            return props.metaTypes.includes(cld.type)
            || cld.type === MetaValueType.OBJECT || cld.type === MetaValueType.OBJECT_ID
          })
          if (childs.length > 0) {
            ops.push({
              label: op.label,
              value: op?.value,
              type: op.type,
              children: childs
            })
          }
        } else if (props.metaTypes.includes(op.type)
          || op.type === MetaValueType.OBJECT || op.type === MetaValueType.OBJECT_ID) {
          ops.push(op)
        }
      });
      return ops
    }
    return metaOptions
  }, [props.metaTypes, metaOptions])

  const optionRender = useMemo(() => {
    return metaTypeOps?.map((option: any) =>
      option.children ? (
        <OptGroup key={option.value} label={option.label}>
          {option.children.map((child: any) => (
            <Option
              disabled={child.disabled}
              key={child.value}
              value={child.value}
            >
              {child.label}
            </Option>
          ))}
        </OptGroup>
      ) : (
        <Option
          disabled={option.disabled}
          key={option.value}
          value={option.value}
        >
          {option.label}
        </Option>
      )
    )
  }, [metaTypeOps])

  const onChange = useCallback(
    (value) => {
      metaTypeOps.forEach((op: IOptionProp) => {
        if (op.children) {
          const cld = op.children.find(child => child.value === value)
          if (cld) {
            props.onChange(cld)
          }
        } else if (op.value === value) {
          props.onChange(op)
        }
      });
      form.setFieldState(formilyField?.path?.entire, (state) => {
        state.value = value
        formilyField.validate()
      })
    },
    [form, formilyField, metaTypeOps],
  )

  return (
    <div>
      {!props.isHiddenResourceBtn && <ResourceCreate 
        fieldMetas={props.flowGraph.fieldMetas as any[]}
        flowGraph={props.flowGraph}
      />}
      <Select
        placeholder={props.placeholder || useLocale('flow.form.placeholder.resourceSelect')}
        value={formilyField.value}
        style={props.style}
        onChange={onChange}
        filterOption={(input, option: any) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        showSearch
      >
        {optionRender}
      </Select>
    </div>
  )
})