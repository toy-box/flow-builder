import React, { FC, useCallback, useEffect, useState } from 'react'
import { useForm, observer, useField } from '@formily/react'
import { TriggerTypeEnum } from '../../../../flow/types'
import { TextWidget } from '../../../widgets'
import './index.less'

export interface IFlowType {
  name: React.ReactElement
  description: React.ReactElement
  flowType: TriggerTypeEnum
}

export const triggerType: FC<any> = observer((props) => {
  const [selectIdx, setSelectIdx] = useState<number>()
  const form = useForm()
  const prefix = 'trigger-type'
  const formilyField = useField() as any

  const flowTypes: IFlowType[] = [
    {
      name: <TextWidget>flow.form.start.recordAfterSave.title</TextWidget>,
      description: <TextWidget>flow.form.start.recordAfterSave.desc</TextWidget>,
      flowType: TriggerTypeEnum.RECORD_BEFORE_SAVE,
    },
    {
      name: <TextWidget>flow.form.start.recordBeforeSave.title</TextWidget>,
      description: <TextWidget>flow.form.start.recordBeforeSave.desc</TextWidget>,
      flowType: TriggerTypeEnum.RECORD_AFTER_SAVE,
    },
  ]

  useEffect(() => {
    const idx = flowTypes.findIndex((meta) => meta.flowType === form.values?.[formilyField?.path?.entire])
    if (idx > -1) setSelectIdx(idx)
  }, [])

  const selectType = useCallback((meta: IFlowType, idx: number) => {
    setSelectIdx(idx)
    form.setFieldState(formilyField?.path?.entire, (state) => {
      state.value = meta.flowType
      formilyField.validate()
    })
  }, [])
  return (
    <div className={prefix}>
      {flowTypes.map((meta: IFlowType, index: number) => (
        <div
          onClick={() => selectType(meta, index)}
          key={index}
          className={`${prefix}-item ${selectIdx === index ? 'active' : ''}`}>
          <div className={prefix + '-item-content'}>
            <h2>{meta.name}</h2>
            <span>{meta.description}</span>
          </div>
        </div>
      ))}
    </div>
  )
})
