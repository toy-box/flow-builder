import React, { FC, useCallback, useMemo } from 'react'
import { useForm, observer } from '@formily/react'
import { FormulaModel } from '../../../form-model'

export const FormulaEdit: FC = observer((props: any) => {
  const form = useForm()
  const onChange = useCallback(
    (value: any) => {
      form.setFieldState('formula', (state) => {
        state.value = value
      })
    },
    [form],
  )
  const valueType = useMemo(() => {
    return form.values.type
  }, [form.values.type])
  return (
    <div>
      <FormulaModel flowGraph={props.flowGraph} valueType={valueType} value={props.value} onChange={(value: string) => onChange(value)}/>
    </div>
  )
})