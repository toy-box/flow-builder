/* eslint-disable react-hooks/rules-of-hooks */
import React, { FC, useState, useEffect } from 'react';
import { Modal } from 'antd';
import { Input, FormItem, Select, FormLayout, FormGrid, PreviewText,
  Space, ArrayItems, Switch, Radio, NumberPicker } from '@formily/antd'
import { createForm, onFieldValueChange } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { ICompareOperation, CompareOP } from '@toy-box/meta-schema';
import { clone } from '@toy-box/toybox-shared';
import { ResourceSelect, FormilyFilter } from '../../formily/components/index'
import { fieldMetaStore } from '../../../store'
import { FlowMetaType, FlowMetaParam, IInputAssignment, ICriteriaCondition } from '../../../flow/types'
import { uid } from '../../../utils';
import { TextWidget } from '../../widgets'
import { useLocale } from '../../../hooks'
import { AutoFlow } from '../../../flow/models/AutoFlow'
import { RepeatErrorMessage } from '../RepeatErrorMessage'

export interface RecordUpdateModelPorps {
  showModel: boolean
  callbackFunc: (data: FlowMetaParam | boolean, type: FlowMetaType) => void
  title?: string | JSX.Element
  metaFlowData?: FlowMetaParam
  flowGraph: AutoFlow,
}

export const RecordUpdateModel: FC<RecordUpdateModelPorps> = ({
  showModel = false,
  callbackFunc,
  title= <TextWidget>flow.form.recordUpdate.addTitle</TextWidget>,
  metaFlowData,
  flowGraph
}) => {
  const [isModalVisible, setIsModalVisible] = useState(showModel);
  const filterName = useLocale('flow.form.recordUpdate.filter')
  const record = useLocale('flow.form.recordUpdate.record')
  const setName = useLocale('flow.form.recordUpdate.setting')
  const setField = useLocale('flow.form.recordUpdate.setField')
  const repeatName = useLocale('flow.form.validator.repeatName')

  
  useEffect(() => {
    setIsModalVisible(showModel);
  }, [showModel]);

  const handleOk = () => {
    console.log(form.values)
    const value = form.values;
    const inputAssignments = value.inputAssignments.map((data: ICompareOperation) => {
      return {
        field: data.source,
        type: data.type,
        value: data.target
      }
    })
    const conditions = value?.criteria?.conditions.map((data: ICompareOperation) => {
      return {
        fieldPattern: data.source,
        operation: data.op,
        type: data.type,
        value: data.target
      }
    })
    const paramData = {
      id: value.id,
      name: value.name,
      connector: {
        targetReference: metaFlowData?.connector?.targetReference || null,
      },
      faultConnector: {
        targetReference: metaFlowData?.faultConnector?.targetReference || null,
      },
      registerId: value.registerId,
      criteria: {
        conditions: conditions
      },
      inputAssignments: inputAssignments,
    }
    console.log(paramData);
    form.submit((resolve) => {
      setIsModalVisible(false);
      callbackFunc(paramData, FlowMetaType.RECORD_UPDATE)
    }).catch((rejected) => {
    })
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    callbackFunc(false, FlowMetaType.RECORD_UPDATE)
  };

  const SchemaField = createSchemaField({
    components: {
      Input,
      FormItem,
      Select,
      FormLayout,
      FormGrid,
      PreviewText,
      ResourceSelect,
      Space,
      ArrayItems,
      Switch,
      Radio,
      NumberPicker,
      FormilyFilter,
    },
  })
  
  const form = createForm({
    effects: () => {
      onFieldValueChange('registerId', (field) => {
        const registers = fieldMetaStore.fieldMetaStore.registers
        const register = registers.find((rg) => rg.id === field.value)
        if (register) {
          form.setFieldState('criteria.conditions', (state) => {
            state.title = `${filterName} ${register.name} ${record}`
            state.value = []
          })
          form.setFieldState('inputAssignments', (state) => {
            state.title = `${setName} ${register.name} ${setField}`
            state.value = []
          })
        }
      })
    }
  })

  if (metaFlowData) {
    const flowData = clone(metaFlowData)
    const inputAssignments = flowData?.inputAssignments.map((data: IInputAssignment) => {
      return {
        source: data.field,
        op: CompareOP.EQ,
        type: data.type,
        target: data.value
      }
    })
    const conditions = flowData?.criteria.conditions.map((data: ICriteriaCondition) => {
      return {
        source: data.fieldPattern,
        op: data.operation,
        type: data.type,
        target: data.value
      }
    })
    flowData.inputAssignments = inputAssignments
    flowData.criteria.conditions = conditions
    form.initialValues = flowData
  }

  const schema = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 2,
        },
        properties: {
          name: {
            type: 'string',
            title: <TextWidget>flow.form.comm.label</TextWidget>,
            required: true,
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.label</TextWidget>
            },
            'x-decorator': 'FormItem',
            'x-component': 'Input'
          },
          id: {
            type: 'string',
            title: <TextWidget>flow.form.comm.value</TextWidget>,
            required: true,
            'x-validator': [{
              triggerType: 'onBlur',
              required: true,
              message: <TextWidget>flow.form.validator.value</TextWidget>,
            }, {
              triggerType: 'onBlur',
              validator: (value: string) => {
                if (!value) return null
                const message = new RepeatErrorMessage(flowGraph, value, metaFlowData, repeatName)
                return message.errorMessage
              }
            }],
            'x-decorator': 'FormItem',
            'x-component': 'Input',
          },
          description: {
            type: 'string',
            title: <TextWidget>flow.form.comm.description</TextWidget>,
            'x-decorator': 'FormItem',
            'x-component': 'Input.TextArea',
            "x-decorator-props": {
              gridSpan: 2
            },
          },
          registerId: {
            type: 'string',
            title: <TextWidget>flow.form.recordUpdate.registerId</TextWidget>,
            required: true,
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.registerId</TextWidget>
            },
            'x-decorator': 'FormItem',
            'x-component': 'ResourceSelect',
            'x-component-props': {
              isHiddenResourceBtn: true,
              mataSource: 'metaData',
              flowGraph,
            },
          },
          web: {
            type: 'string',
            title: '',
            'x-decorator': 'FormItem',
          },
          'criteria.conditions': {
            type: 'number',
            title: <TextWidget>flow.form.recordUpdate.conditions</TextWidget>,
            // required: true,
            // 'x-validator': {
            //   required: true,
            //   message: <TextWidget>flow.form.validator.filter</TextWidget>
            // },
            'x-decorator': 'FormItem',
            'x-component': 'FormilyFilter',
            "x-decorator-props": {
              gridSpan: 2
            },
            'x-component-props': {
              reactionKey: 'registerId',
              mataSource: 'metaData',
              specialMode: true,
              flowGraph,
            },
            'x-reactions': {
              dependencies: ['registerId'],
              fulfill: {
                schema: {
                  'x-display': "{{$deps != '' ? 'visible' : 'none'}}",
                },
              },
            },
          },
          inputAssignments: {
            type: 'number',
            title: <TextWidget>flow.form.recordUpdate.inputAssignments</TextWidget>,
            'x-decorator': 'FormItem',
            'x-component': 'FormilyFilter',
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.inputAssignments</TextWidget>
            },
            "x-decorator-props": {
              gridSpan: 2
            },
            'x-component-props': {
              simple: true,
              specialMode: true,
              mataSource: 'metaData',
              reactionKey: 'registerId',
              flowGraph,
            },
            'x-reactions': {
              dependencies: ['registerId'],
              fulfill: {
                schema: {
                  'x-display': "{{$deps != '' ? 'visible' : 'none'}}",
                },
              },
            },
          },
        },
      },
    },
  }

  return (
    <>
      <Modal width={900} title={title} visible={isModalVisible} onOk={handleOk} cancelText={<TextWidget>flow.form.comm.cencel</TextWidget>} okText={<TextWidget>flow.form.comm.submit</TextWidget>} onCancel={handleCancel}>
        <div className="loop-index">
          <PreviewText.Placeholder value={<TextWidget>flow.form.comm.empty</TextWidget>}>
            <FormLayout layout='vertical' colon={false}>
              <FormProvider form={form}>
                <SchemaField schema={schema} />
              </FormProvider>
            </FormLayout>
          </PreviewText.Placeholder>
        </div>
      </Modal>
    </>
  )
}
