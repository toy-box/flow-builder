import React, { FC, useState, useEffect } from 'react';
import { Modal } from 'antd';
import { Input, FormItem, Select, FormLayout, FormGrid, PreviewText } from '@formily/antd'
import { createForm } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { ResourceSelect } from '../../formily/components/index'
import { IFlowResourceType } from '../../../flow/types'
import { FlowMetaType, FlowMetaParam } from '../../../flow/types'
// import { uid } from '../../../utils';
import { TextWidget } from '../../widgets'
import { useLocale } from '../../../hooks'
import { AutoFlow } from '../../../flow/models/AutoFlow'
import { RepeatErrorMessage } from '../RepeatErrorMessage'
import { apiReg } from '../interface'

export interface LoopModelPorps {
  showModel: boolean
  callbackFunc: (data: FlowMetaParam | boolean, type: FlowMetaType) => void
  title?: string | JSX.Element
  loopData?: FlowMetaParam
  flowGraph: AutoFlow,
}

export const LoopModel: FC<LoopModelPorps> = ({
  showModel = false,
  callbackFunc,
  title= <TextWidget>flow.form.loop.addTitle</TextWidget>,
  loopData,
  flowGraph
}) => {
  const [isModalVisible, setIsModalVisible] = useState(showModel)

  
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
          targetReference: loopData?.nextValueConnector?.targetReference || null,
        },
        defaultConnector: {
          targetReference: loopData?.defaultConnector?.targetReference || null,
        },
        collectionReference: value.collectionReference,
        iterationOrder: value.iterationOrder
      }
      console.log(paramData);
      setIsModalVisible(false);
      callbackFunc(paramData, FlowMetaType.LOOP)
    }).catch((rejected) => {
    })
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    callbackFunc(false, FlowMetaType.LOOP)
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

  useEffect(() => {
    if (loopData) {
      console.log(loopData);
      form.setValues(loopData)
    }
  }, [loopData, form])

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
                const message = new RepeatErrorMessage(flowGraph, value, loopData, apiReg)
                return message.errorMessage && <TextWidget>{message.errorMessage}</TextWidget>
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
          collectionReference: {
            type: 'string',
            title: <TextWidget>flow.form.loop.collectionReference</TextWidget>,
            required: true,
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.collectionReference</TextWidget>
            },
            'x-decorator': 'FormItem',
            'x-component': 'ResourceSelect',
            'x-component-props': {
              isHiddenResourceBtn: false,
              mataSource: 'flowJson',
              flowJsonTypes: [{
                value: IFlowResourceType.VARIABLE_ARRAY
              }, {
                value: IFlowResourceType.VARIABLE_ARRAY_RECORD
              }],
              flowGraph,
            },
          },
          web: {
            type: 'string',
            title: '',
            'x-decorator': 'FormItem',
          },
          iterationOrder: {
            type: 'string',
            title: <TextWidget>flow.form.loop.iterationOrder</TextWidget>,
            required: true,
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.iterationOrder</TextWidget>
            },
            enum: [
              {
                label: <TextWidget>flow.form.loop.iterationOrderOption.asc</TextWidget>,
                value: 'asc',
              },
              {
                label: <TextWidget>flow.form.loop.iterationOrderOption.desc</TextWidget>,
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
