import React, { FC, useState, useEffect, useCallback } from 'react';
import { Modal } from 'antd';
import { Input, FormItem, Select, FormLayout, FormGrid, PreviewText, FormButtonGroup, Radio, NumberPicker } from '@formily/antd'
import { createForm } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { ICompareOperation, CompareOP } from '@toy-box/meta-schema';
import { clone } from '@toy-box/toybox-shared';
import { BranchArrays, ResourceSelect, FormilyFilter } from '../../formily/components/index'
import { FlowMetaType, FlowMetaParam, IOutParameter } from '../../../flow/types'
import { uid } from '../../../utils';
import { TextWidget } from '../../widgets'
import { useLocale } from '../../../hooks'
import { AutoFlow } from '../../../flow/models/AutoFlow'
import { RepeatErrorMessage } from '../RepeatErrorMessage'

export interface SuspendModelPorps {
  showModel: boolean
  callbackFunc: (data: FlowMetaParam | boolean, type: FlowMetaType) => void
  title?: string | JSX.Element
  metaFlowData?: FlowMetaParam
  flowGraph: AutoFlow,
}

export const SuspendModel: FC<SuspendModelPorps> = ({
  showModel = false,
  callbackFunc,
  title= <TextWidget>flow.form.suspend.addTitle</TextWidget>,
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
    const quiredRules = value?.waitEvents?.map((rule: any) => {
      const outParameters = rule.outParameters.map((data: ICompareOperation) => {
        return {
          id: data.source,
          type: data.type,
          value: data.target
        }
      })
      if (rule.sourceTime) {
        return {
          id: uid(),
          name: rule.name,
          connector: {
            targetReference: rule?.connector?.targetReference || null,
          },
          recoveryTimeInfo: {
            dateValue: rule.dateValue,
            offsetNum: rule.offsetNum,
            offsetUnit: rule.offsetUnit,
          },
          outParameters,
        }
      }
      return {
        id: uid(),
        name: rule.name,
        connector: {
          targetReference: rule?.connector?.targetReference || null,
        },
        recoveryTimeInfo: {
          registerId: rule.registerId,
          field: rule.field,
          recordIdValue: rule.recordIdValue,
          offsetNum: rule.offsetNum,
          offsetUnit: rule.offsetUnit,
        },
        outParameters,
      }
    })
    const paramData = {
      id: value.id,
      name: value.name,
      connector: {
        targetReference: metaFlowData?.connector?.targetReference || null,
      },
      defaultConnector: {
        targetReference: metaFlowData?.defaultConnector?.targetReference || null,
      },
      description: value.description,
      waitEvents: quiredRules,
    }
    form.submit((resolve) => {
      setIsModalVisible(false);
      callbackFunc(paramData, FlowMetaType.WAIT)
    }).catch((rejected) => {
    })
  };

  const WaitDesc = () => {
    return <div className="wait-desc">
      定义恢复时间
    </div>
  }

  const handleCancel = () => {
    setIsModalVisible(false);
    callbackFunc(false, FlowMetaType.WAIT)
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
      NumberPicker,
      FormilyFilter,
      WaitDesc
    },
  })
  
  const form = createForm()

  if (metaFlowData) {
    const val = clone(metaFlowData)
    const quiredRules = val?.waitEvents?.map((rule: any) => {
      const outParameters = rule.outParameters.map((data: IOutParameter) => {
        return {
          source: data.id,
          op: CompareOP.EQ,
          type: data.type,
          target: data.value
        }
      })
      return {
        id: rule.id,
        name: rule.name,
        connector: {
          targetReference: rule?.connector?.targetReference || null,
        },
        dateValue: rule.recoveryTimeInfo.dateValue,
        registerId: rule.recoveryTimeInfo.registerId,
        field: rule.recoveryTimeInfo.field,
        sourceTime: rule.recoveryTimeInfo.registerId ? false : true,
        recordIdValue: rule.recoveryTimeInfo.recordIdValue,
        offsetNum: rule.recoveryTimeInfo.offsetNum,
        offsetUnit: rule.recoveryTimeInfo.offsetUnit,
        outParameters,
      }
    })
    form.initialValues = {
      id: val.id,
      name: val.name,
      connector: {
        targetReference: val?.connector?.targetReference || null,
      },
      defaultConnector: {
        targetReference: val?.defaultConnector?.targetReference || null,
      },
      description: val.description,
      waitEvents: quiredRules,
    }
  } else {
    form.setValues(
      {
        waitEvents: [{
          name: '',
          id: uid(),
          criteria: {
            conditions: [{}],
          },
          description: '',
        }]
      }
    )
  }

  const myReaction = useCallback((bool, field) => {
    const val = form.values
    const idx = field?.path?.segments[1];
    const sourceTime = idx > -1 && val?.waitEvents[idx]?.sourceTime
    field.display = sourceTime === bool ? 'visible' : 'none';
  }, [form.values])

  const descTipHtml = <div className="branch-arrays-tip">
    <p className="tip">
      <TextWidget>flow.form.suspend.tip</TextWidget>
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
          waitEvents: {
            type: 'array',
            title: '',
            'x-decorator': 'FormItem',
            'x-component': 'BranchArrays',
            "x-decorator-props": {
              gridSpan: 2,
            },
            'x-component-props': {
              title: <TextWidget>flow.form.suspend.title</TextWidget>,
              descTipHtml: descTipHtml,
              addDescription: <TextWidget>flow.form.suspend.sortTitle</TextWidget>,
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
                    removeMessage: <TextWidget>flow.form.suspend.removeBtn</TextWidget>,
                  },
                  properties: {
                    name: {
                      type: 'string',
                      title: <TextWidget>flow.form.suspend.rule.name</TextWidget>,
                      required: true,
                      'x-validator': {
                        required: true,
                        message: <TextWidget>flow.form.validator.suspendLabel</TextWidget>
                      },
                      'x-decorator': 'FormItem',
                      'x-component': 'Input',
                    },
                    sourceTime: {
                      type: 'boolean',
                      title: <TextWidget>flow.form.suspend.rule.sourceTime</TextWidget>,
                      default: true,
                      required: true,
                      enum: [
                        {
                          label: <TextWidget>flow.form.suspend.option.time</TextWidget>,
                          value: true,
                        },
                        {
                          label: <TextWidget>flow.form.suspend.option.recordTime</TextWidget>,
                          value: false,
                        },
                      ],
                      'x-decorator': 'FormItem',
                      'x-component': 'Radio.Group',
                      "x-decorator-props": {
                        gridSpan: 2
                      },
                    },
                    desc: {
                      type: 'string',
                      title: '',
                      // 'x-decorator': 'FormItem',
                      'x-component': 'WaitDesc',
                      "x-decorator-props": {
                        gridSpan: 2
                      },
                    },
                    registerId: {
                      type: 'string',
                      title: <TextWidget>flow.form.suspend.rule.registerId</TextWidget>,
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
                      'x-reactions': myReaction.bind(this, false),
                    },
                    field: {
                      type: 'string',
                      title: <TextWidget>flow.form.suspend.rule.field</TextWidget>,
                      required: true,
                      'x-validator': {
                        required: true,
                        message: <TextWidget>flow.form.validator.field</TextWidget>
                      },
                      'x-decorator': 'FormItem',
                      'x-component': 'Input',
                      'x-reactions': myReaction.bind(this, false),
                    },
                    recordIdValue: {
                      type: 'string',
                      title: <TextWidget>flow.form.suspend.rule.recordIdValue</TextWidget>,
                      required: true,
                      'x-validator': {
                        required: true,
                        message: <TextWidget>flow.form.validator.recordIdValue</TextWidget>
                      },
                      'x-decorator': 'FormItem',
                      'x-component': 'ResourceSelect',
                      'x-component-props': {
                        isHiddenResourceBtn: false,
                        mataSource: 'flowJson',
                        placeholder: <TextWidget>flow.form.placeholder.recordIdValue</TextWidget>,
                        flowGraph,
                      },
                      'x-reactions': myReaction.bind(this, false),
                    },
                    dateValue: {
                      type: 'string',
                      title: <TextWidget>flow.form.suspend.rule.dateValue</TextWidget>,
                      required: true,
                      'x-validator': {
                        required: true,
                        message: <TextWidget>flow.form.validator.dateValue</TextWidget>
                      },
                      'x-decorator': 'FormItem',
                      'x-component': 'ResourceSelect',
                      'x-component-props': {
                        isHiddenResourceBtn: false,
                        mataSource: 'flowJson',
                        placeholder: <TextWidget>flow.form.placeholder.dateValue</TextWidget>,
                        flowGraph,
                      },
                      'x-reactions': myReaction.bind(this, true),
                    },
                    offsetNum: {
                      type: 'number',
                      title: <TextWidget>flow.form.suspend.rule.offsetNum</TextWidget>,
                      'x-decorator': 'FormItem',
                      'x-component': 'NumberPicker',
                    },
                    offsetUnit: {
                      type: 'string',
                      title: <TextWidget>flow.form.suspend.rule.offsetUnit</TextWidget>,
                      'x-decorator': 'FormItem',
                      'x-component': 'Input',
                      'x-validator': [{
                        triggerType: 'onBlur',
                        validator: (value: string) => {
                          if (!value || value === 'Hours' || value === 'Days') return null
                          return <TextWidget>flow.form.validator.offsetUnit</TextWidget>
                        }
                      }],
                    },
                    outParameters: {
                      type: 'array',
                      title: <TextWidget>flow.form.suspend.outParameters</TextWidget>,
                      required: true,
                      'x-decorator': 'FormItem',
                      'x-component': 'FormilyFilter',
                      "x-decorator-props": {
                        gridSpan: 2
                      },
                      'x-component-props': {
                        simple: true,
                        specialMode: true,
                        isShowResourceBtn: true,
                        mataSource: 'flowJson',
                        flowGraph,
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
      <Modal width={1080} title={title} visible={isModalVisible} onOk={handleOk} cancelText={<TextWidget>flow.form.comm.cencel</TextWidget>} okText={<TextWidget>flow.form.comm.submit</TextWidget>} onCancel={handleCancel}>
        <div className="suspend-index">
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
