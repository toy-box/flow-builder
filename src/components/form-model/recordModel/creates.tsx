/* eslint-disable react-hooks/rules-of-hooks */
import React, { FC, useState, useEffect } from 'react';
import { Modal } from 'antd';
import { Input, FormItem, Select, FormLayout, FormGrid, PreviewText,
  Space, ArrayItems, Switch, Radio, NumberPicker } from '@formily/antd'
import { createForm, onFieldValueChange } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { fieldMetaStore } from '../../../store'
import { ResourceSelect, FormilyFilter } from '../../formily/components/index'
import { IFlowResourceType, FlowMetaType, FlowMetaParam } from '../../../flow/types'
import { uid } from '../../../utils';
import { TextWidget } from '../../widgets'
import { useLocale } from '../../../hooks'

export interface RecordCreateModelPorps {
  showModel: boolean
  callbackFunc: (data: FlowMetaParam | boolean, type: FlowMetaType) => void
  title?: string | JSX.Element
  metaFlowData?: FlowMetaParam
}

export const RecordCreateModel: FC<RecordCreateModelPorps> = ({
  showModel = false,
  callbackFunc,
  title= <TextWidget>flow.form.recordCreate.addTitle</TextWidget>,
  metaFlowData
}) => {
  const [isModalVisible, setIsModalVisible] = useState(showModel);
  const setName = useLocale('flow.form.recordCreate.setting')
  const setField = useLocale('flow.form.recordCreate.setField')
  const saveId = useLocale('flow.form.recordCreate.saveId')

  
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
      inputAssignments: value.inputAssignments,
      storeOutputAutomatically: value.storeOutputAutomatically,
      assignRecordIdToReference: value.assignRecordIdToReference,
    }
    console.log(paramData);
    form.submit((resolve) => {
      setIsModalVisible(false);
      callbackFunc(paramData, FlowMetaType.RECORD_CREATE)
    }).catch((rejected) => {
    })
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    callbackFunc(false, FlowMetaType.RECORD_CREATE)
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
          form.setFieldState('inputAssignments', (state) => {
            state.title = `${setName} ${register.name} ${setField}`
          })
          form.setFieldState('assignRecordIdToReference', (state) => {
            state.title = `${saveId} ${register.name} ID`
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
            title: <TextWidget>flow.form.recordCreate.registerId</TextWidget>,
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
          inputAssignments: {
            type: 'array',
            title: <TextWidget>flow.form.recordCreate.inputAssignments</TextWidget>,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'FormilyFilter',
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
          storeOutputAutomatically: {
            type: 'boolean',
            title: <TextWidget>flow.form.recordCreate.storeOutputAutomatically</TextWidget>,
            'x-decorator': 'FormItem',
            'x-component': 'Switch',
            "x-decorator-props": {
              gridSpan: 2
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
          assignRecordIdToReference: {
            type: 'string',
            title: <TextWidget>flow.form.recordCreate.assignRecordIdToReference</TextWidget>,
            'x-decorator': 'FormItem',
            'x-component': 'ResourceSelect',
            'x-component-props': {
              mataSource: 'flowJson',
              placeholder: <TextWidget>flow.form.placeholder.assignRecordIdToReference</TextWidget>,
              flowJsonTypes: [{
                value: IFlowResourceType.VARIABLE
              }]
            },
            'x-reactions': {
              dependencies: ['storeOutputAutomatically'],
              fulfill: {
                schema: {
                  'x-display': "{{$deps == 'true' ? 'visible' : 'none'}}",
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
