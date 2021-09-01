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

export interface RecordCreateModelPorps {
  showModel: boolean
  callbackFunc: (data: FlowMetaParam | boolean, type: FlowMetaType) => void
  title?: string
}

export const RecordCreateModel: FC<RecordCreateModelPorps> = ({
  showModel = false,
  callbackFunc,
  title= "新建创建记录"
}) => {
  const [isModalVisible, setIsModalVisible] = useState(showModel);

  
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
        targetReference: null,
      },
      defaultConnector: {
        targetReference: null,
      },
      registerId: value.registerId,
      inputAssignments: value.inputAssignments,
      storeOutputAutomatically: value.storeOutputAutomatically,
      assignRecordIdToReference: value.assignRecordIdToReference,
    }
    console.log(paramData);
    form.submit((resolve) => {
      setIsModalVisible(false);
      callbackFunc(paramData, FlowMetaType.RECORD_CREATES)
    }).catch((rejected) => {
    })
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    callbackFunc(false, FlowMetaType.RECORD_CREATES)

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
            state.title = `设置 ${register.name} 的字段值`
          })
          form.setFieldState('assignRecordIdToReference', (state) => {
            state.title = `在变量中存储 ${register.name} ID`
          })
        }
      })
    }
  })
  form.setValues({
    sortOptions: []
  })

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
            title: '标签',
            required: true,
            'x-validator': {
              required: true,
              message: '标签是必填项'
            },
            'x-decorator': 'FormItem',
            'x-component': 'Input'
          },
          id: {
            type: 'string',
            title: 'API名称',
            required: true,
            'x-validator': {
              required: true,
              message: 'API名称是必填项'
            },
            'x-decorator': 'FormItem',
            'x-component': 'Input',
          },
          description: {
            type: 'string',
            title: '描述',
            'x-decorator': 'FormItem',
            'x-component': 'Input.TextArea',
            "x-decorator-props": {
              gridSpan: 2
            },
          },
          registerId: {
            type: 'string',
            title: '对象记录',
            required: true,
            'x-validator': {
              required: true,
              message: '对象记录是必填项'
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
            title: '设置字段值',
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'FormilyFilter',
            "x-decorator-props": {
              gridSpan: 2
            },
            'x-component-props': {
              simple: true,
              paramKey: 'inputAssignments',
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
            title: '手动分配变量',
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
            title: '变量',
            'x-decorator': 'FormItem',
            'x-component': 'ResourceSelect',
            'x-component-props': {
              mataSource: 'flowJson',
              placeholder: '请选择变量',
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
      <Modal width={900} title={title} visible={isModalVisible} onOk={handleOk} cancelText="取消" okText="确认" onCancel={handleCancel}>
        <div className="loop-index">
          <PreviewText.Placeholder value="暂无数据">
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
