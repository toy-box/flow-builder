import React, { FC, useState, useEffect } from 'react';
import { Modal, Divider } from 'antd';
import { Input, FormItem, Select, FormLayout, FormGrid, PreviewText, FormButtonGroup } from '@formily/antd'
import { createForm } from '@formily/core'
// import { observer } from '@formily/reactive-react'
import { FormProvider, createSchemaField } from '@formily/react'
import { ICompareOperation, MetaValueType } from '@toy-box/meta-schema';
import { clone } from '@toy-box/toybox-shared';
import { FormilyFilter } from '../formily/components/index'
import './index.less'
import { TextWidget } from '../widgets'
import { AutoFlow } from '../../flow/models/AutoFlow'
import { RepeatErrorMessage } from './RepeatErrorMessage'
import { useLocale } from '../../hooks'
import { AssignmentOpEnum } from './interface'

import { FlowMetaType, FlowMetaParam, IAssignmentData, IFlowResourceType, opTypeEnum } from '../../flow/types'
export interface AssignmentModelPorps {
  showModel: boolean
  callbackFunc: (data: FlowMetaParam | boolean, type: FlowMetaType) => void
  title?: string | JSX.Element
  assignmentData?: FlowMetaParam
  flowGraph: AutoFlow,
}

export const AssignmentModel:FC<AssignmentModelPorps> = ({
  showModel = false,
  callbackFunc,
  title= <TextWidget>flow.form.assignment.addTitle</TextWidget>,
  assignmentData,
  flowGraph
}) => {
  const [isModalVisible, setIsModalVisible] = useState(showModel);
  const repeatName = useLocale('flow.form.validator.repeatName')
  const textOps = [
    { label: useLocale('flow.metaValueType.assign'), value: AssignmentOpEnum.ASSIGN },
    { label: useLocale('flow.metaValueType.add'), value: AssignmentOpEnum.ADD }
  ]
  const numOps = [
    { label: useLocale('flow.metaValueType.assign'), value: AssignmentOpEnum.ASSIGN },
    { label: useLocale('flow.metaValueType.add'), value: AssignmentOpEnum.ADD },
    { label: useLocale('flow.metaValueType.subtract'), value: AssignmentOpEnum.SUBTRACT },
  ]
  const eqOps = [
    { label: useLocale('flow.metaValueType.assign'), value: AssignmentOpEnum.ASSIGN },
  ]
  const varArrayOps = [
    { label: useLocale('flow.metaValueType.assign'), value: AssignmentOpEnum.ASSIGN },
    { label: useLocale('flow.metaValueType.add'), value: AssignmentOpEnum.ADD },
    { label: useLocale('flow.metaValueType.addAtStart'), value: AssignmentOpEnum.ADD_AT_START },
    { label: useLocale('flow.metaValueType.removeFirst'), value: AssignmentOpEnum.REMOVE_FIRST },
    { label: useLocale('flow.metaValueType.removeAll'), value: AssignmentOpEnum.REMOVE_ALL },
  ]
  const operatOptions = [{
    type: IFlowResourceType.VARIABLE,
    children: [
      { type: MetaValueType.STRING, children: textOps },
      { type: MetaValueType.TEXT, children: textOps },
      { type: MetaValueType.NUMBER, children: numOps },
      { type: MetaValueType.BOOLEAN, children: eqOps },
      { type: MetaValueType.DATE, children: numOps },
      { type: MetaValueType.DATETIME, children: eqOps },
    ]
  }, {
    type: IFlowResourceType.VARIABLE_RECORD,
    children: [
      { type: MetaValueType.OBJECT_ID, children: eqOps },
      { type: MetaValueType.OBJECT, children: eqOps },
    ]
  }, {
    type: IFlowResourceType.VARIABLE_ARRAY,
    children: [
      { type: MetaValueType.STRING, children: varArrayOps },
      { type: MetaValueType.TEXT, children: varArrayOps },
      { type: MetaValueType.NUMBER, children: varArrayOps },
      { type: MetaValueType.BOOLEAN, children: varArrayOps },
      { type: MetaValueType.DATE, children: varArrayOps },
      { type: MetaValueType.DATETIME, children: varArrayOps },
      { type: MetaValueType.ARRAY, children: varArrayOps },
    ]
  }, {
    type: IFlowResourceType.VARIABLE_ARRAY_RECORD,
    children: [
      { type: MetaValueType.ARRAY, children: varArrayOps },
    ]
  }]
  
  useEffect(() => {
    setIsModalVisible(showModel);
  }, [showModel]);

  const handleOk = () => {
    const value = form.values;
    const assignmentItems = value?.assignmentItems.map((data: ICompareOperation) => {
      return {
        assignToReference: data.source,
        operation: data.op,
        type: data.type || opTypeEnum.INPUT,
        value: data.target
      }
    })
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
      assignmentItems,
    }
    console.log(paramData, 'paramData')
    form.submit((resolve) => {
      setIsModalVisible(false);
      callbackFunc(paramData, FlowMetaType.ASSIGNMENT)
    }).catch((rejected) => {
    })
  };

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
    const flowData = clone(assignmentData)
    const assignmentItems = flowData?.assignmentItems.map((data: IAssignmentData) => {
      return {
        source: data.assignToReference,
        op: data.operation,
        type: data.type || opTypeEnum.INPUT,
        target: data.value
      }
    })
    flowData.assignmentItems = assignmentItems
    form.setValues(flowData)
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
            'x-validator': [{
              triggerType: 'onBlur',
              required: true,
              message: <TextWidget>flow.form.validator.value</TextWidget>,
            }, {
              triggerType: 'onBlur',
              validator: (value: string) => {
                if (!value) return null
                const message = new RepeatErrorMessage(flowGraph, value, assignmentData, repeatName)
                return message.errorMessage
              }
            }],
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
              operatType: 'replace',
              operatOptions: operatOptions,
              flowJsonTypes: [{
                value: IFlowResourceType.VARIABLE
              }, {
                value: IFlowResourceType.VARIABLE_RECORD
              }, {
                value: IFlowResourceType.VARIABLE_ARRAY
              }, {
                value: IFlowResourceType.VARIABLE_ARRAY_RECORD
              }],
              flowGraph,
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
};