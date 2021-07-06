import React, { FC, useState, useCallback, useMemo } from 'react'
import { Input, Select } from '@formily/antd'
import { MetaValueType } from '@toy-box/meta-schema';
import { useForm, observer } from '@formily/react'


export const GatherInput: FC = observer((props: any) => {
  const form = useForm()
  const changeValue = useCallback((e) => {
    props.onChange(e.target.value)
  }, [props])
  const filterValueInput = useMemo(() => {
    switch (form.values.type) {
      case MetaValueType.TEXT:
      case MetaValueType.STRING:
      case MetaValueType.NUMBER:
        return <Input type={form.values.type} onChange={changeValue} value={props.value} />
      case MetaValueType.SINGLE_OPTION:
        return <Input onChange={changeValue} value={props.value} />
      default:
        return null
    }
  }, [changeValue, form.values.type, props.value])
  return (
    <div>
      { filterValueInput }
    </div>
  )
})