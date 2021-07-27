import React, { FC, useCallback, useMemo } from 'react'
import { useForm, observer, useFieldSchema } from '@formily/react'
import { Select } from 'antd'
import { IFieldOption } from '@toy-box/meta-schema'
import { ResourceCreate } from '../../../form-model/ResourceCreate'
import { fieldMetaStore } from '../../../../store'
import { isArr } from '@formily/shared'

const { OptGroup, Option } = Select

export const ResourceSelect: FC = observer((props: any) => {
  const { fieldMetas, registers } = fieldMetaStore.fieldMetaStore
  const schema = useFieldSchema()

  const form = useForm()
  const onChange = useCallback(
    (value) => {
      form.setFieldState(props.paramKey, (state) => {
        state.value = value
      })
    },
    [form, props.paramKey],
  )

  const metaOptions = useMemo(() => {
    if (props.mataSource === 'metaData') {
      if (props.reactionKey) {
        const reactionKey = form.values[props.reactionKey]
        let registerOps: IFieldOption[] = []
        registers.some((re) => {
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
      const options = registers.map((r) => {
        return {
          label: r.name,
          value: r.id,
        }
      })
      return options
    }
    const resourceFieldMetas = fieldMetas as any[]
    let metas = resourceFieldMetas;
    if (isArr(props.flowJsonTypes)) {
      metas = []
      props.flowJsonTypes.forEach((op: any) => {
        if (isArr(op.children)) {
          const meta = resourceFieldMetas.find((meta: any) => op.value === meta.value)
          const children = meta?.children.filter((child: any) => {
            const opIdx = op?.children.findIndex((type: string) => child.type === type)
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
          metas.push(resourceFieldMetas.find((meta: any) => op.value === meta.value))
        }
      })
    }
    return metas.map((field: any) => {
      if (field.children) {
        const children = field.children.map((child: any) => ({
          label: child.name,
          value: child.key,
        }))
        return {
          label: field.label,
          value: field.value,
          children,
        }
      } else {
        return {
          label: field.name,
          value: field.key,
        }
      }
    })
  }, [fieldMetas, form.values, props.mataSource, props.reactionKey, props.flowJsonTypes, registers])

  const optionRender = useMemo(() => {
    return metaOptions?.map((option: any) =>
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
  }, [metaOptions])

  return (
    <div>
      {!props.isHiddenResourceBtn && <ResourceCreate 
        fieldMetas={fieldMetas as any[]}
      />}
      <Select
        placeholder={props.placeholder || '请选择集合变量'}
        value={props.value}
        style={props.style}
        onChange={onChange}
      >
        {optionRender}
      </Select>
    </div>
  )
})