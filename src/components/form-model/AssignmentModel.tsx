import React, { FC, useState, useEffect, useCallback } from 'react';
import { Modal, Divider } from 'antd';
import { Input, FormItem, Select, FormLayout, FormGrid, PreviewText, FormButtonGroup } from '@formily/antd'
import { createForm } from '@formily/core'
import { observer } from '@formily/reactive-react'
import { FormProvider, createSchemaField } from '@formily/react'
import { FormilyFilter } from '../formily/components/index'
import './index.less'
import { fieldMetaStore } from '../../store'
import { TextWidget } from '../widgets'

import { FlowMetaType, FlowMetaParam } from '../../flow/types'
export interface AssignmentModelPorps {
  showModel: boolean
  callbackFunc: (data: FlowMetaParam | boolean, type: FlowMetaType) => void
  title?: string | JSX.Element
  assignmentData?: FlowMetaParam
}

export const AssignmentModel:FC<AssignmentModelPorps> = observer(({
  showModel = false,
  callbackFunc,
  title= <TextWidget>flow.form.assignment.addTitle</TextWidget>,
  assignmentData
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
      connector: {
        targetReference: assignmentData?.connector?.targetReference || null,
      },
      defaultConnector: {
        targetReference: assignmentData?.defaultConnector?.targetReference || null,
      },
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
          <TextWidget>flow.form.assignment.setVariable</TextWidget>
        </div>
        <div className="assignment-desc">
          <TextWidget>flow.form.assignment.tip</TextWidget>
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

  if (assignmentData) {
    form.setValues(assignmentData)
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
            title: <TextWidget>flow.form.comm.label</TextWidget>,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Input'
          },
          id: {
            type: 'string',
            title: <TextWidget>flow.form.comm.value</TextWidget>,
            required: true,
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
      <Modal width={900} title={title} visible={isModalVisible} onOk={handleOk} cancelText={<TextWidget>flow.form.comm.cencel</TextWidget>} okText={<TextWidget>flow.form.comm.submit</TextWidget>} onCancel={handleCancel}>
        <div className="assignment-index">
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
  );
});