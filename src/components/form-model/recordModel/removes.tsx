import React, { FC, useState, useEffect } from 'react';
import { Modal } from 'antd';
import { Input, FormItem, Select, FormLayout, FormGrid, PreviewText,
  Space, ArrayItems, Switch, Radio, NumberPicker } from '@formily/antd'
import { createForm, onFieldValueChange } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { clone } from '@toy-box/toybox-shared';
import { ICompareOperation } from '@toy-box/meta-schema';
import { ResourceSelect, FormilyFilter } from '../../formily/components/index'
import { FlowMetaType, FlowMetaParam, ICriteriaCondition } from '../../../flow/types'
import { uid } from '../../../utils';
import { TextWidget } from '../../widgets'
import { useLocale } from '../../../hooks'
import { AutoFlow } from '../../../flow/models/AutoFlow'
import { RepeatErrorMessage } from '../RepeatErrorMessage'

export interface RecordRemoveModelPorps {
  showModel: boolean
  callbackFunc: (data: FlowMetaParam | boolean, type: FlowMetaType) => void
  title?: string | JSX.Element
  metaFlowData?: FlowMetaParam
  flowGraph: AutoFlow,
}

export const RecordRemoveModel: FC<RecordRemoveModelPorps> = ({
  showModel = false,
  callbackFunc,
  title= <TextWidget>flow.form.recordRemove.addTitle</TextWidget>,
  metaFlowData,
  flowGraph
}) => {
  const [isModalVisible, setIsModalVisible] = useState(showModel);
  const repeatName = useLocale('flow.form.validator.repeatName')

  
  useEffect(() => {
    setIsModalVisible(showModel);
  }, [showModel]);

  const handleOk = () => {
    console.log(form.values)
    const value = form.values;
    const conditions = value?.criteria?.conditions.map((data: ICompareOperation) => {
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
        targetReference: metaFlowData?.connector?.targetReference || null,
      },
      faultConnector: {
        targetReference: metaFlowData?.faultConnector?.targetReference || null,
      },
      registerId: value.registerId,
      criteria: {
        conditions
      },
    }
    console.log(paramData);
    form.submit((resolve) => {
      setIsModalVisible(false);
      callbackFunc(paramData, FlowMetaType.RECORD_DELETE)
    }).catch((rejected) => {
    })
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    callbackFunc(false, FlowMetaType.RECORD_DELETE)
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
        form.setFieldState('criteria.conditions', (state) => {
          state.value = []
        })
      })
    }
  })

  if (metaFlowData) {
    const flowData = clone(metaFlowData)
    const conditions = flowData?.criteria.conditions.map((data: ICriteriaCondition) => {
      return {
        source: data.fieldPattern,
        op: data.operation,
        type: data.type,
        target: data.value
      }
    })
    flowData.criteria.conditions = conditions
    form.initialValues = flowData
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
        properties: {
          name: {
            type: 'string',
            title: <TextWidget>flow.form.comm.label</TextWidget>,
            required: true,
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.label</TextWidget>
            },
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
                const message = new RepeatErrorMessage(flowGraph, value, metaFlowData, repeatName)
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
          registerId: {
            type: 'string',
            title: <TextWidget>flow.form.recordRemove.registerId</TextWidget>,
            required: true,
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.registerId</TextWidget>
            },
            'x-decorator': 'FormItem',
            'x-component': 'ResourceSelect',
            'x-component-props': {
              isHiddenResourceBtn: true,
              mataSource: 'metaData',
              flowGraph,
            },
          },
          web: {
            type: 'string',
            title: '',
            'x-decorator': 'FormItem',
          },
          'criteria.conditions': {
            type: 'number',
            title: <TextWidget>flow.form.recordRemove.conditions</TextWidget>,
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
              reactionKey: 'registerId',
              mataSource: 'metaData',
              specialMode: true,
              flowGraph,
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
      <Modal width={900} title={title} visible={isModalVisible} onOk={handleOk} cancelText={<TextWidget>flow.form.comm.cencel</TextWidget>} okText={<TextWidget>flow.form.comm.submit</TextWidget>} onCancel={handleCancel}>
        <div className="loop-index">
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
  )
}
