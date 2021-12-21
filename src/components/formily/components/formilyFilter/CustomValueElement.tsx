import React, { FC, useMemo } from 'react'
import { MetaValueType } from '@toy-box/meta-schema'
import { FormulaModel } from '../../../form-model'
import { AutoFlow } from '../../../../flow/models/AutoFlow'

export interface ICustomValueElementProps {
  flowGraph: AutoFlow
  value?: any
  resourceFieldMetas: any[]
  onChange: (value: string) => void
}

export const CustomValueElement: FC<any> = ({
  flowGraph,
  value,
  resourceFieldMetas,
  onChange,
  ...props
}) => {
  const customValueElement = useMemo(() => {
    const { index } = props
    if (index >= 0) {
      const sourceValue = value?.[index]?.target
      const source = value?.[index]?.source
      let resourceFieldMeta = undefined as any
      resourceFieldMetas.some((meta: { children: any[] }) => {
        if (meta.children) {
          resourceFieldMeta = meta.children.find((child: { key: any; }) => child.key === source)
          if (resourceFieldMeta) return resourceFieldMeta
        }
      })
      return <FormulaModel flowGraph={flowGraph} value={sourceValue} valueType={resourceFieldMeta?.type} onChange={(value: string) => onChange(value)} />
    }
  }, [props.flowGraph, value, resourceFieldMetas, props.index])
  return (
    <div>
      {customValueElement}
    </div>
  )
}