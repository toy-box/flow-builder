import React, { FC, useState, useEffect } from 'react';
import { Modal } from 'antd';
import { Input, FormItem, Select, FormLayout, FormGrid, PreviewText, FormButtonGroup } from '@formily/antd'
import { createForm } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { BranchArrays } from '../../formily/components/index'
import { FlowMetaTypes, FlowMetaParam } from '../../../flow/types'
import { uid } from '../../../utils';

export interface SuspendModelPorps {
  showModel: boolean
  callbackFunc: (data: FlowMetaParam | boolean, type: FlowMetaTypes) => void
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
    form.submit((resolve) => {
      setIsModalVisible(false);
      callbackFunc(form.values, FlowMetaTypes.SUSPENDS)
    }).catch((rejected) => {
    })
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    callbackFunc(false, FlowMetaTypes.SUSPENDS)
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
      BranchArrays
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
            'x-decorator': 'FormItem',
            'x-component': 'Input'
          },
          id: {
            type: 'string',
            title: 'API名称',
            required: true,
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
                      'x-decorator': 'FormItem',
                      'x-component': 'Input',
                    },
                    eventType: {
                      type: 'string',
                      title: '恢复事件类型',
                      required: true,
                      'x-decorator': 'FormItem',
                      'x-component': 'Input',
                    },
                    description: {
                      type: 'string',
                      title: '暂停配置描述',
                      'x-decorator': 'FormItem',
                      'x-component': 'Input.TextArea',
                      "x-decorator-props": {
                        gridSpan: 2
                      },
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
