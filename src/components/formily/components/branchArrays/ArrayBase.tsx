import React, { createContext, useContext } from 'react'
import {
  DeleteOutlined,
} from '@ant-design/icons'
// import { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon'
import { ButtonProps } from 'antd/lib/button'
import { ArrayField, JSXComponent } from '@formily/core'
import { useField, useFieldSchema, Schema } from '@formily/react'
import { isValid } from '@formily/shared'

// import { FormilyFilterBuilder } from './FormilyFilterBuilder'

export interface IArrayBaseAdditionProps extends ButtonProps {
  title?: string
  method?: 'push' | 'unshift'
  defaultValue?: any
}

export interface IArrayBaseContext {
  props: IArrayBaseProps
  field: ArrayField
  schema: Schema
}

export interface IArrayBaseItemProps {
  index: number
}

export type ArrayBaseMixins = {
  Remove?: React.FC<any>
  Index?: React.FC<any>
  // FormilyFilterBuilder?: React.FC<any>
  useArray?: () => IArrayBaseContext
  useIndex?: () => number
}

export interface IArrayBaseProps {
  disabled?: boolean
  onRemove?: (index: number) => void
}

type ComposedArrayBase = React.FC<React.PropsWithChildren<IArrayBaseProps>> &
  ArrayBaseMixins & {
    Item: React.FC<React.PropsWithChildren<IArrayBaseItemProps>>
    mixin: <T extends JSXComponent>(
      target: T
    ) => T & ArrayBaseMixins
  }

const ArrayBaseContext = createContext<IArrayBaseContext>(
  {} as IArrayBaseContext)

const ItemContext = createContext<IArrayBaseItemProps>(
  {} as IArrayBaseItemProps
)

const useArray = () => {
  return useContext(ArrayBaseContext)
}

const useIndex = (index?: number) => {
  const ctx = useContext(ItemContext)
  return ctx ? ctx.index : index
}

// const getDefaultValue: any = (defaultValue: any, schema: Schema) => {
//   if (isValid(defaultValue)) return defaultValue
//   if (Array.isArray(schema?.items))
//     return getDefaultValue(defaultValue, schema.items[0])
//   if (schema?.items?.type === 'array') return []
//   if (schema?.items?.type === 'boolean') return true
//   if (schema?.items?.type === 'date') return ''
//   if (schema?.items?.type === 'datetime') return ''
//   if (schema?.items?.type === 'number') return 0
//   if (schema?.items?.type === 'object') return {}
//   if (schema?.items?.type === 'string') return ''
//   return null
// }

export const ArrayBase: ComposedArrayBase = (props) => {
  const field = useField<ArrayField>()
  const schema = useFieldSchema()
  return (
    <ArrayBaseContext.Provider value={{ field, schema, props }}>
      {props.children}
    </ArrayBaseContext.Provider>
  )
}

ArrayBase.Item = ({ children, ...props }) => {
  return <ItemContext.Provider value={props}>{children}</ItemContext.Provider>
}

ArrayBase.Index =  React.forwardRef((props, ref) => {
  const index = useIndex(props.index) as number
  return <span {...props}>#{index + 1}.</span>
})

ArrayBase.Remove = React.forwardRef((props, ref) => {
  const index = useIndex(props.index) as number
  const array = useArray()
  if (!array) return null
  if (array.field?.pattern !== 'editable') return null
  return (
    <DeleteOutlined
      {...props}
      ref={ref}
      onClick={(e) => {
        if (array.props?.disabled) return
        e.stopPropagation()
        array.field?.remove?.(index)
        array.props?.onRemove?.(index)
        if (props.onClick) {
          props.onClick(e)
        }
      }}
    />
  )
})

// ArrayBase.FormilyFilterBuilder = React.forwardRef((props, ref) => {
//   const index = useIndex(props.index) as number
//   const array = useArray()
//   if (!array) return null
//   if (array.field?.pattern !== 'editable') return null
//   return (
//     <FormilyFilterBuilder
//       selectIndex={index}
//     />
//   )
// })

ArrayBase.useArray = useArray
// ArrayBase.useIndex = useIndex
ArrayBase.mixin = (target: any) => {
  target.Index = ArrayBase.Index
  target.Remove = ArrayBase.Remove
  // target.FormilyFilterBuilder = ArrayBase.FormilyFilterBuilder
  target.useArray = ArrayBase.useArray
  target.useIndex = ArrayBase.useIndex
  return target
}