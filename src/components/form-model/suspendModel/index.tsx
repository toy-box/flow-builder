import React, { FC, useState, useEffect, useCallback } from 'react';
import { Modal } from 'antd';
import { Input, FormItem, Select, FormLayout, FormGrid, PreviewText, FormButtonGroup, Radio, NumberPicker } from '@formily/antd'
import { createForm } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { BranchArrays, ResourceSelect } from '../../formily/components/index'
import { FlowMetaType, FlowMetaParam } from '../../../flow/types'
import { uid } from '../../../utils';

export interface SuspendModelPorps {
  showModel: boolean
  callbackFunc: (data: FlowMetaParam | boolean, type: FlowMetaType) => void
  title?: string
}

export const SuspendModel: FC<SuspendModelPorps> = ({
  showModel = false,
  callbackFunc,
  title= "新建暂停"
}) => {
  const [isModalVisible, setIsModalVisible] = useState(showModel);

  
  useEffect(() => {
    setIsModalVisible(showModel);
  }, [showModel]);

  const handleOk = () => {
    console.log(form.values)
    const value = form.values;
    const quiredRules = value?.rules?.map((rule: any) => {
      if (rule.sourceTime) {
        return {
          id: uid(),
          name: rule.name,
          dataValue: rule.dataValue,
          offsetNum: rule.offsetNum,
          offsetUnit: rule.offsetUnit,
        }
      }
      return {
        id: uid(),
        name: rule.name,
        registerId: rule.registerId,
        field: rule.field,
        recordIdValue: rule.recordIdValue,
        offsetNum: rule.offsetNum,
        offsetUnit: rule.offsetUnit,
      }
    })
    const paramData = {
      id: value.id,
      name: value.name,
      description: value.description,
      rules: quiredRules,
    }
    form.submit((resolve) => {
      setIsModalVisible(false);
      callbackFunc(paramData, FlowMetaType.SUSPEND)
    }).catch((rejected) => {
    })
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    callbackFunc(false, FlowMetaType.SUSPEND)
  };

  const SchemaField = createSchemaField({
    components: {
      Input,
      FormItem,
      Select,
      FormLayout,
      FormGrid,
      PreviewText,
      FormButtonGroup,
      BranchArrays,
      Radio,
      ResourceSelect,
      NumberPicker
    },
  })
  
  const form = createForm()

  form.setValues(
    {
      rules: [{
        name: '',
        id: uid(),
        criteria: {
          conditions: [{}],
        },
        description: '',
      }]
    }
  )

  const myReaction = useCallback((bool, field) => {
    const val = form.values
    const idx = field?.path?.segments[1];
    const sourceTime = idx > -1 && val?.rules[idx]?.sourceTime
    field.display = sourceTime === bool ? 'visible' : 'none';
  }, [form.values])

  const descTipHtml = <div className="branch-arrays-tip">
    <p className="tip">
    对于每个可以恢复流的事件，添加暂停配置。此事件可以指定时间或平台事件消息。暂停条件确定是否在事件发生之前暂停流。在未满足暂停条件时，流会使用默认路径，而不暂停。
    </p>
  </div>

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
          rules: {
            type: 'array',
            title: '',
            'x-decorator': 'FormItem',
            'x-component': 'BranchArrays',
            "x-decorator-props": {
              gridSpan: 2,
            },
            'x-component-props': {
              title: '新建暂停配置',
              descTipHtml: descTipHtml,
              addDescription: '暂停配置',
            },
            items: {
              type: 'object',
              properties: {
                layout: {
                  type: 'void',
                  'x-component': 'FormLayout',
                  'x-component-props': {
                    gridSpan: 2,
                    layout: 'vertical',
                    colon: false,
                    removeMessage: '删除暂停配置',
                  },
                  properties: {
                    name: {
                      type: 'string',
                      title: '暂停配置标签',
                      required: true,
                      'x-validator': {
                        required: true,
                        message: '暂停配置标签是必填项'
                      },
                      'x-decorator': 'FormItem',
                      'x-component': 'Input',
                    },
                    sourceTime: {
                      type: 'boolean',
                      title: '时间源',
                      default: true,
                      required: true,
                      enum: [
                        {
                          label: '特定时间',
                          value: true,
                        },
                        {
                          label: '记录时间',
                          value: false,
                        },
                      ],
                      'x-decorator': 'FormItem',
                      'x-component': 'Radio.Group',
                      "x-decorator-props": {
                        gridSpan: 2
                      },
                    },
                    registerId: {
                      type: 'string',
                      title: '获取对象记录',
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
                      'x-reactions': myReaction.bind(this, false),
                    },
                    field: {
                      type: 'string',
                      title: '字段',
                      required: true,
                      'x-validator': {
                        required: true,
                        message: '字段是必填项'
                      },
                      'x-decorator': 'FormItem',
                      'x-component': 'Input',
                      'x-reactions': myReaction.bind(this, false),
                    },
                    recordIdValue: {
                      type: 'string',
                      title: '记录',
                      required: true,
                      'x-validator': {
                        required: true,
                        message: '记录是必填项'
                      },
                      'x-decorator': 'FormItem',
                      'x-component': 'ResourceSelect',
                      'x-component-props': {
                        isHiddenResourceBtn: false,
                        mataSource: 'flowJson',
                        placeholder: '请选择记录'
                      },
                      'x-reactions': myReaction.bind(this, false),
                    },
                    dataValue: {
                      type: 'string',
                      title: '基本时间',
                      required: true,
                      'x-validator': {
                        required: true,
                        message: '基本时间是必填项'
                      },
                      'x-decorator': 'FormItem',
                      'x-component': 'ResourceSelect',
                      'x-component-props': {
                        isHiddenResourceBtn: false,
                        mataSource: 'flowJson',
                        placeholder: '请选择时间数据'
                      },
                      'x-reactions': myReaction.bind(this, true),
                    },
                    offsetNum: {
                      type: 'number',
                      title: '偏移数字',
                      'x-decorator': 'FormItem',
                      'x-component': 'NumberPicker',
                    },
                    offsetUnit: {
                      type: 'string',
                      title: '偏移单位（小时或天数）',
                      'x-decorator': 'FormItem',
                      'x-component': 'Input',
                      'x-validator': [{
                        triggerType: 'onBlur',
                        validator: (value: string) => {
                          if (!value || value === 'Hours' || value === 'Days') return null
                          return '请输入“Hours”或“Days”'
                        }
                      }],
                    },
                  },
                },
              },
            },
          },
        },
      },
    // },
    },
  }

  

  return (
    <>
      <Modal width={900} title={title} visible={isModalVisible} onOk={handleOk} cancelText="取消" okText="确认" onCancel={handleCancel}>
        <div className="suspend-index">
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
