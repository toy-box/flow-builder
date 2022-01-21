import React, { FC, useCallback, useMemo } from 'react'
import { useForm, observer, useField } from '@formily/react'
import { Select } from 'antd'
import { isArr } from '@formily/shared'
import { IFieldOption, MetaValueType } from '@toy-box/meta-schema'
import { ResourceCreate } from '../../../form-model/ResourceCreate'
import { useLocale } from '../../../../hooks'
import { debug } from 'console'


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

  const index = useMemo(() => {
    if (props.reactionObj) {
      const entire = formilyField?.path?.entire.split('.')
      return entire?.[1]
    }
    return -1
  }, 
  [props.reactionObj, formilyField?.path?.entire])

  const reactionData = useMemo(() => {
    const val = form.values?.[props.reactionObj]?.[index]?.[props.reactionKey]
    let obj: any = null
    if (val) {
      form.setFieldState(`${props.reactionObj}.${index}.${props.reactionKey}`, (state) => {
        state.dataSource?.some(data => {
          if (data.value === val) {
            obj = data
            return data
          }
        })
      })
    }
    return obj
  }, [props.reactionObj, index, props.reactionKey, form.values?.[props.reactionObj]?.[index]?.[props.reactionKey]])

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
            const opIdx = op?.children.findIndex((type: string) => child.webType === type && child.refRegisterId === props.refRegisterId)
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
            if (props.refRegisterId) {
              if (child.refRegisterId === props.refRegisterId) return child
              return false
            } else if (reactionData) {
              if (child.type === reactionData?.type) return child
              return false
            }
            return child
          })
          if (meta && children?.length > 0) metas.push({
            label: meta.label,
            value: meta.value,
            children,
          })
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
  },[
    props.flowGraph.fieldMetas,
    form.values, props.mataSource, 
    props.reactionKey, 
    props.flowJsonTypes, 
    props.flowGraph.registers, 
    form.values[props.reactionKey],
    props.refRegisterId,
    reactionData
  ])

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

  const disabled = useMemo(() => {
    if (props.reactionObj) {
      if (index > -1) {
        const val = form.values?.[props.reactionObj]?.[index]?.[props.reactionKey]
        if (val) return false
        return true
      }
      return false
    }
    return false
  }, [props.reactionObj, props.reactionKey, form.values?.[props.reactionObj]?.[index]?.[props.reactionKey]])

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
        disabled={disabled}
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