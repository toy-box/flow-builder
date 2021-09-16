/* eslint-disable react-hooks/rules-of-hooks */
import React, { FC, useState, useEffect } from 'react';
import { Modal } from 'antd';
import { Input, FormItem, Select, FormLayout, FormGrid, PreviewText,
  Space, ArrayItems, Switch, Radio, NumberPicker } from '@formily/antd'
import { createForm, onFieldValueChange } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { ResourceSelect, FormilyFilter } from '../../formily/components/index'
import { fieldMetaStore } from '../../../store'
import { FlowMetaType, FlowMetaParam } from '../../../flow/types'
import { uid } from '../../../utils';
import { TextWidget } from '../../widgets'
import { useLocale } from '../../../hooks'

export interface RecordUpdateModelPorps {
  showModel: boolean
  callbackFunc: (data: FlowMetaParam | boolean, type: FlowMetaType) => void
  title?: string
  metaFlowData?: FlowMetaParam
}

export const RecordUpdateModel: FC<RecordUpdateModelPorps> = ({
  showModel = false,
  callbackFunc,
  title= <TextWidget>flow.form.recordUpdate.addTitle</TextWidget>,
  metaFlowData
}) => {
  const [isModalVisible, setIsModalVisible] = useState(showModel);
  const filterName = useLocale('flow.form.recordUpdate.filter')
  const record = useLocale('flow.form.recordUpdate.record')
  const setName = useLocale('flow.form.recordUpdate.setting')
  const setField = useLocale('flow.form.recordUpdate.setField')

  
  useEffect(() => {
    setIsModalVisible(showModel);
  }, [showModel]);

  const handleOk = () => {
    console.log(form.values)
    const value = form.values;
    const paramData = {
      id: value.id,
      name: value.name,
      connector: {
        targetReference: metaFlowData?.connector?.targetReference || null,
      },
      defaultConnector: {
        targetReference: metaFlowData?.defaultConnector?.targetReference || null,
      },
      registerId: value.registerId,
      criteria: {
        conditions: value.criteria.conditions
      },
      inputAssignments: value.inputAssignments,
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
          })
          form.setFieldState('inputAssignments', (state) => {
            state.title = `${setName} ${register.name} ${setField}`
          })
        }
      })
    }
  })

  useEffect(() => {
    if (metaFlowData) {
      form.setValues(metaFlowData)
    }
  }, [form, metaFlowData])

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
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.value</TextWidget>
            },
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
            required: true,
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.filter</TextWidget>
            },
            'x-decorator': 'FormItem',
            'x-component': 'FormilyFilter',
            "x-decorator-props": {
              gridSpan: 2
            },
            'x-component-props': {
              reactionKey: 'registerId',
              mataSource: 'metaData',
              specialMode: true,
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
              mataSource: 'metaData',
              reactionKey: 'registerId',
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
