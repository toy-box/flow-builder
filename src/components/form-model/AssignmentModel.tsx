import React, { FC, useState, useEffect, useCallback } from 'react';
import { Modal, Divider } from 'antd';
import { Input, FormItem, Select, FormLayout, FormGrid, PreviewText, FormButtonGroup } from '@formily/antd'
import { createForm } from '@formily/core'
import { observer } from '@formily/reactive-react'
import { FormProvider, createSchemaField } from '@formily/react'
import { FormilyFilter } from '../formily/components/index'
import './index.less'
import { fieldMetaStore } from '../../store'

import { FlowMetaType, FlowMetaParam } from '../../flow/types'
export interface AssignmentModelPorps {
  showModel: boolean
  callbackFunc: (data: FlowMetaParam | boolean, type: FlowMetaType) => void
  title?: string
}

export const AssignmentModel:FC<AssignmentModelPorps> = observer(({
  showModel = false,
  callbackFunc,
  title= "新建分配"
}) => {
  const [isModalVisible, setIsModalVisible] = useState(showModel);
  
  useEffect(() => {
    setIsModalVisible(showModel);
  }, [showModel]);

  const handleOk = () => {
    const value = form.values;
    const paramData = {
      id: value.id,
      name: value.name,
      description: value.description,
      assignmentItems: value.assignmentItems,
    }
    console.log(paramData, 'paramData')
    form.submit((resolve) => {
      setIsModalVisible(false);
      callbackFunc(paramData, FlowMetaType.ASSIGNMENT)
    }).catch((rejected) => {
    })
  };

  useEffect(() => {
    console.log(fieldMetaStore.fieldMetaStore, 'fieldMetas')
  }, [])

  const handleCancel = () => {
    setIsModalVisible(false);
    callbackFunc(false, FlowMetaType.ASSIGNMENT)
  };

  const AssignmentDesc = () => {
    return <div>
      <Divider />
      <div className="assignment-content">
        <div className="assignment-title">
          设置变量值
        </div>
        <div className="assignment-desc">
          每个变量由运算符和值组合修改。
        </div>
      </div>
    </div>
  }

  const SchemaField = createSchemaField({
    components: {
      Input,
      FormItem,
      Select,
      FormLayout,
      FormGrid,
      PreviewText,
      FormButtonGroup,
      AssignmentDesc,
      FormilyFilter
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
      // layout: {
      //   type: 'void',
      //   'x-component': 'FormLayout',
      //   'x-component-props': {
      //     labelCol: 6,
      //     wrapperCol: 10,
      //     colon: false,
      //     layout: 'vertical'
      //   },
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
          desc: {
            type: 'string',
            title: '',
            'x-decorator': 'FormItem',
            'x-component': 'AssignmentDesc',
            "x-decorator-props": {
              gridSpan: 2
            },
          },
          assignmentItems: {
            type: 'array',
            title: '',
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'FormilyFilter',
            "x-decorator-props": {
              gridSpan: 2
            },
            'x-component-props': {
              mataSource: 'flowJson',
              isShowResourceBtn: true,
              specialMode: true,
            },
          },
        },
      },
    },
  }

  return (
    <>
      <Modal width={900} title={title} visible={isModalVisible} onOk={handleOk} cancelText="取消" okText="确认" onCancel={handleCancel}>
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
  );
});