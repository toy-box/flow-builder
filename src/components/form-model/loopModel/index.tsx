import React, { FC, useState, useEffect } from 'react';
import { Modal } from 'antd';
import { Input, FormItem, Select, FormLayout, FormGrid, PreviewText } from '@formily/antd'
import { createForm } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { ResourceSelect } from '../../formily/components/index'
import { IFlowResourceType } from '../../../flow/types'
import { uid } from '../../../utils';

export interface LoopModelPorps {
  showModel: boolean
  callbackFunc: (bool: boolean) => void
  title?: string
}

export const LoopModel: FC<LoopModelPorps> = ({
  showModel = false,
  callbackFunc,
  title= "新建循环"
}) => {
  const [isModalVisible, setIsModalVisible] = useState(showModel);

  
  useEffect(() => {
    setIsModalVisible(showModel);
  }, [showModel]);

  const handleOk = () => {
    console.log(form.values)
    form.submit((resolve) => {
      const value = form.values;
      const paramData = {
        id: value.id,
        name: value.name,
        nextValueConnector: {
          targetReference: null,
        },
        defaultConnector: {
          targetReference: null,
        },
        collectionReference: value.collectionReference,
        iterationOrder: value.iterationOrder
      }
      console.log(paramData);
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
      ResourceSelect
    },
  })
  
  const form = createForm()

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
          collectionReference: {
            type: 'string',
            title: '集合变量',
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'ResourceSelect',
            'x-component-props': {
              isHiddenResourceBtn: false,
              paramKey: 'collectionReference',
              mataSource: 'flowJson',
              flowJsonTypes: [{
                value: IFlowResourceType.VARIABLE_ARRAY
              }, {
                value: IFlowResourceType.VARIABLE_ARRAY_RECORD
              }]
            },
          },
          web: {
            type: 'string',
            title: '',
            'x-decorator': 'FormItem',
          },
          iterationOrder: {
            type: 'string',
            title: '排序方向',
            required: true,
            enum: [
              {
                label: '第一个项目到最后一个项目',
                value: 'asc',
              },
              {
                label: '最后一个项目到第一个项目',
                value: 'desc',
              },
            ],
            'x-decorator': 'FormItem',
            'x-component': 'Select',
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
