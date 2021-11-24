import React, { FC, useCallback } from 'react'
import { useForm, observer } from '@formily/react'
import { FormulaModel } from '../../../form-model'

export const FormulaEdit: FC = observer((props: any) => {
  const form = useForm()
  const onChange = useCallback(
    (value) => {
      form.setFieldState('formula', (state) => {
        state.value = value
      })
    },
    [form],
  )
  return (
    <div>
      <FormulaModel value={props.value} onChange={(value: string) => onChange(value)}/>
    </div>
  )
})