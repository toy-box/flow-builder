import React, { FC, useState, useEffect, useCallback } from 'react';
import { Modal, Divider } from 'antd';
import { FormItem, FormLayout, FormGrid,
  PreviewText, FormButtonGroup, Radio, DatePicker, TimePicker, Select } from '@formily/antd'
import { createForm } from '@formily/core'
// import { observer } from '@formily/reactive-react'
import { FormProvider, createSchemaField } from '@formily/react'
import { ICompareOperation, MetaValueType } from '@toy-box/meta-schema';
import { clone } from '@toy-box/toybox-shared';
import { FormilyFilter, ResourceSelect, triggerType } from '../formily/components/index'
import './index.less'
import { TextWidget } from '../widgets'
import { AutoFlow } from '../../flow/models/AutoFlow'
import { useLocale } from '../../hooks'
import { FlowMetaType, 
  IStartFlowMeta, 
  RecordTriggerTypeEnum, 
  TriggerTypeEnum, 
  ICriteriaCondition,
  FlowTypeCodeEnum, } from '../../flow/types'

export interface StartModelPorps {
  showModel: boolean
  callbackFunc: (data: IStartFlowMeta | boolean, type: FlowMetaType) => void
  title?: string | JSX.Element
  startData?: IStartFlowMeta
  flowGraph: AutoFlow,
  isObject?: boolean
}

export const StartModel:FC<StartModelPorps> = ({
  showModel = false,
  callbackFunc,
  title,
  startData,
  flowGraph,
  isObject = false
}) => {
  const [isModalVisible, setIsModalVisible] = useState(showModel);
  
  useEffect(() => {
    setIsModalVisible(showModel);
  }, [showModel]);

  const handleOk = () => {
    const value = form.values;
    const conditions = value?.criteria?.conditions?.map((data: ICompareOperation) => {
      return {
        fieldPattern: data.source,
        operation: data.op,
        type: data.type,
        value: data.target
      }
    })
    const paramData = {
      id: value.id,
      name: value.name,
      connector: {
        targetReference: startData?.connector?.targetReference || null,
      },
      description: value.description,
      criteria: {
        conditions,
        logic: '$and'
      },
      type: value.type,
      objectId: value.objectId,
      recordTriggerType: value.recordTriggerType,
      schedule: value.schedule,
      triggerType: value.triggerType,
    }
    console.log(paramData, 'paramData')
    form.submit((resolve) => {
      setIsModalVisible(false);
      callbackFunc(paramData, FlowMetaType.START)
    }).catch((rejected) => {
    })
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    callbackFunc(false, FlowMetaType.ASSIGNMENT)
  };

  const SchemaField = createSchemaField({
    components: {
      FormItem,
      FormLayout,
      FormGrid,
      PreviewText,
      FormButtonGroup,
      FormilyFilter,
      ResourceSelect,
      Radio,
      triggerType,
      DatePicker,
      TimePicker,
      Select,
    },
  })
  
  const form = createForm()

  if (startData) {
    const flowData = clone(startData)
    const conditions = flowData?.criteria?.conditions?.map((data: ICriteriaCondition) => {
      return {
        source: data.fieldPattern,
        op: data.operation,
        type: data.type,
        target: data.value
      }
    })
    if (flowData?.criteria?.conditions) {
      flowData.criteria.conditions = conditions
    } else {
      flowData['criteria.conditions'] = []
    }
    form.setValues(flowData)
  }

  const isCriteria = useCallback((field) => {
    const val = form.values
    const objectId = val.objectId
    const isShow = objectId && flowGraph.flowType === FlowTypeCodeEnum.RECORD_TRIGGER
    field.display = isShow || (objectId && isObject) ? 'visible' : 'none';
  }, [form.values])

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
          'schedule.startDate': {
            type: 'string',
            title: <TextWidget>flow.form.start.startDate</TextWidget>,
            required: true,
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.startDate</TextWidget>
            },
            'x-decorator': 'FormItem',
            'x-component': 'DatePicker',
            'x-visible': flowGraph.flowType === FlowTypeCodeEnum.PLAN_TRIGGER && !isObject,
          },
          'schedule.startTime': {
            type: 'string',
            title: <TextWidget>flow.form.start.startTime</TextWidget>,
            required: true,
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.startTime</TextWidget>
            },
            'x-decorator': 'FormItem',
            'x-component': 'TimePicker',
            'x-visible': flowGraph.flowType === FlowTypeCodeEnum.PLAN_TRIGGER && !isObject,
          },
          'schedule.frequency': {
            type: 'string',
            title: <TextWidget>flow.form.start.frequency</TextWidget>,
            required: true,
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.frequency</TextWidget>
            },
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            enum: [
              { label: '一次', value: 'Once' },
              { label: '每天', value: 'Daily' },
              { label: '每周', value: 'Weekly' },
            ],
            'x-visible': flowGraph.flowType === FlowTypeCodeEnum.PLAN_TRIGGER && !isObject,
          },
          objectId: {
            type: 'string',
            title: <TextWidget>flow.form.start.objectId</TextWidget>,
            required: true,
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.registerId</TextWidget>
            },
            'x-decorator': 'FormItem',
            'x-component': 'ResourceSelect',
            'x-visible': flowGraph.flowType === FlowTypeCodeEnum.RECORD_TRIGGER || isObject,
            'x-component-props': {
              isHiddenResourceBtn: true,
              mataSource: 'metaData',
              flowGraph,
            },
          },
          web: {
            type: 'string',
            title: '',
            'x-visible': flowGraph.flowType === FlowTypeCodeEnum.RECORD_TRIGGER || isObject,
            'x-decorator': 'FormItem',
          },
          recordTriggerType: {
            type: 'string',
            title: <TextWidget>flow.form.start.recordTriggerType</TextWidget>,
            default: RecordTriggerTypeEnum.CREATE,
            'x-visible': flowGraph.flowType === FlowTypeCodeEnum.RECORD_TRIGGER,
            required: true,
            enum: [
              {
                label: <TextWidget>flow.form.start.create</TextWidget>,
                value: RecordTriggerTypeEnum.CREATE,
              },
              {
                label: <TextWidget>flow.form.start.update</TextWidget>,
                value: RecordTriggerTypeEnum.UPDATE,
              },
              {
                label: <TextWidget>flow.form.start.createOrUpdate</TextWidget>,
                value: RecordTriggerTypeEnum.CREATE_OR_UPDATE,
              },
              {
                label: <TextWidget>flow.form.start.delete</TextWidget>,
                value: RecordTriggerTypeEnum.DELETE,
              },
            ],
            'x-decorator': 'FormItem',
            'x-component': 'Radio.Group',
            "x-decorator-props": {
              gridSpan: 2
            },
          },
          'criteria.conditions': {
            type: 'number',
            title: <TextWidget>flow.form.start.criteria</TextWidget>,
            'x-decorator': 'FormItem',
            'x-component': 'FormilyFilter',
            "x-decorator-props": {
              gridSpan: 2
            },
            'x-component-props': {
              reactionKey: 'objectId',
              mataSource: 'metaData',
              specialMode: true,
              flowGraph,
            },
            'x-reactions': isCriteria,
          },
          triggerType: {
            type: 'string',
            title: <TextWidget>flow.form.start.triggerType</TextWidget>,
            default: TriggerTypeEnum.RECORD_BEFORE_SAVE,
            'x-visible': flowGraph.flowType === FlowTypeCodeEnum.RECORD_TRIGGER,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'triggerType',
            "x-decorator-props": {
              gridSpan: 2
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