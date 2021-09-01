import React, { FC, useState, useEffect, useCallback } from 'react';
import { Modal, Divider } from 'antd';
import { Input, FormItem, Select, FormLayout, FormGrid, PreviewText, FormButtonGroup } from '@formily/antd'
import { createForm } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { BranchArrays } from '../../formily/components/index'
import { uid } from '../../../utils';
import { isObj } from '@formily/shared';
import { FlowMetaType, FlowMetaParam } from '../../../flow/types'
export interface DecisionModelPorps {
  showModel: boolean
  callbackFunc: (data: FlowMetaParam | boolean, type: FlowMetaType) => void
  title?: string
}

export const DecisionModel: FC<DecisionModelPorps> = ({
  showModel = false,
  callbackFunc,
  title= "新建决策",
}) => {
  const [isModalVisible, setIsModalVisible] = useState(showModel);
  
  useEffect(() => {
    setIsModalVisible(showModel);
  }, [showModel]);

  const handleOk = () => {
    console.log(form.values)
    form.submit((resolve) => {
      const value = form.values;
      value.rules.forEach((rule: any) => {
        if (!isObj(rule.connector)) {
          rule.connector = {
            targetReference: null
          }
        }
      })
      const paramData = {
        id: value.id,
        name: value.name,
        defaultConnector: {
          targetReference: null,
        },
        defaultConnectorName: '默认分支',
        rules: value.rules,
      }
      console.log(paramData);
      setIsModalVisible(false);
      callbackFunc(paramData, FlowMetaType.DECISIONS)
    }).catch((rejected) => {
    })
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    callbackFunc(false, FlowMetaType.DECISIONS)
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
    <p className="name">结果</p>
    <p className="tip">
    对于流可以使用的每个路径，创建结果。对于每个结果，指定必须满足的条件，以便流使用该路径。
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
              title: '新结果',
              descTipHtml: descTipHtml,
              addDescription: '结果顺序',
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
                    removeMessage: '删除结果',
                  },
                  properties: {
                    name: {
                      type: 'string',
                      title: '标签',
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
                    'criteria.conditions': {
                      type: 'void',
                      'x-component': 'BranchArrays.FormilyFilterBuilder',
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
      <Modal width={1080} title={title} visible={isModalVisible} onOk={handleOk} cancelText="取消" okText="确认" onCancel={handleCancel}>
        <div className="assignment-index">
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
