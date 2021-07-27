import React, { FC, useState, useEffect } from 'react';
import { Modal } from 'antd';
import { Input, FormItem, Select, FormLayout, FormGrid, PreviewText,
  Space, ArrayItems, Switch, Radio, NumberPicker } from '@formily/antd'
import { createForm, onFieldValueChange } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { ResourceSelect, FormilyFilter } from '../../formily/components/index'
import { fieldMetaStore } from '../../../store'
import { uid } from '../../../utils';

export interface RecordUpdateModelPorps {
  showModel: boolean
  callbackFunc: (bool: boolean) => void
  title?: string
}

export const RecordUpdateModel: FC<RecordUpdateModelPorps> = ({
  showModel = false,
  callbackFunc,
  title= "新建更新记录"
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
      registerId: value.registerId,
      criteria: {
        conditions: value.criteria.conditions
      },
      inputAssignments: value.inputAssignments,
    }
    console.log(paramData);
    form.submit((resolve) => {
      setIsModalVisible(false);
      callbackFunc(false)
    }).catch((rejected) => {
    })
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    callbackFunc(false)
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
            state.title = `筛选 ${register.name} 记录`
          })
          form.setFieldState('inputAssignments', (state) => {
            state.title = `设置 ${register.name} 的字段值`
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
            title: '更新对象记录',
            required: true,
            'x-validator': {
              required: true,
              message: '对象记录是必填项'
            },
            'x-decorator': 'FormItem',
            'x-component': 'ResourceSelect',
            'x-component-props': {
              isHiddenResourceBtn: true,
              paramKey: 'registerId',
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
            title: '筛选记录',
            required: true,
            'x-validator': {
              required: true,
              message: '筛选记录是必填项'
            },
            'x-decorator': 'FormItem',
            'x-component': 'FormilyFilter',
            "x-decorator-props": {
              gridSpan: 2
            },
            'x-component-props': {
              paramKey: 'criteria.conditions',
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
            title: '设置字段值',
            'x-decorator': 'FormItem',
            'x-component': 'FormilyFilter',
            'x-validator': {
              required: true,
              message: '字段值是必填项'
            },
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
