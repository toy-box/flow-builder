/* eslint-disable react-hooks/rules-of-hooks */
import React, { FC, useState, useEffect } from 'react';
import { Modal } from 'antd';
import { Input, FormItem, Select, FormLayout, FormGrid, PreviewText, FormButtonGroup } from '@formily/antd'
import { createForm } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { clone, isObj } from '@formily/shared';
import { ICompareOperation } from '@toy-box/meta-schema';
import { BranchArrays, FormilyFilter } from '../../formily/components/index'
import { uid } from '../../../utils';
import { FlowMetaType, FlowMetaParam, ICriteriaCondition, opTypeEnum } from '../../../flow/types'
import { TextWidget } from '../../widgets'
import { useLocale } from '../../../hooks'
import { AutoFlow } from '../../../flow/models/AutoFlow'
import { RepeatErrorMessage } from '../RepeatErrorMessage'
import { apiReg } from '../interface'

export interface DecisionModelPorps {
  showModel: boolean
  callbackFunc: (data: FlowMetaParam | boolean, type: FlowMetaType) => void
  title?: string | JSX.Element
  decisionData?: FlowMetaParam
  flowGraph: AutoFlow,
}

export const DecisionModel: FC<DecisionModelPorps> = ({
  showModel = false,
  callbackFunc,
  title= <TextWidget>flow.form.decision.addTitle</TextWidget>,
  decisionData,
  flowGraph
}) => {
  const [isModalVisible, setIsModalVisible] = useState(showModel);
  const [defaultConnectorName, setDefaultConnectorName] = useState(useLocale('flow.form.decision.defaultConnectorName'))
  
  useEffect(() => {
    setIsModalVisible(showModel);
  }, [showModel]);

  const handleOk = () => {
    console.log(form.values)
    form.submit((resolve) => {
      const value = form.values;
      value.rules.forEach((rule: any) => {
        if (!isObj(rule.connector) && !decisionData) {
          rule.connector = {
            targetReference: null
          }
        } else if (isObj(rule.connector)) {
          rule.connector = {
            targetReference: rule.connector.targetReference || decisionData?.connector?.targetReference || null
          }
        }
        const conditions = rule?.criteria?.conditions.map((data: ICompareOperation) => {
          return {
            fieldPattern: data.source,
            operation: data.op,
            type: data.type || opTypeEnum.INPUT,
            value: data.target
          }
        })
        rule.criteria.conditions = conditions
        rule.criteria.logic = '$and'
      })
      const paramData = {
        id: value.id,
        name: value.name,
        connector: {
          targetReference: decisionData?.connector?.targetReference || null,
        },
        defaultConnector: {
          targetReference: decisionData?.defaultConnector?.targetReference || null,
        },
        defaultConnectorName: decisionData?.defaultConnectorName || defaultConnectorName,
        rules: value.rules,
      }
      console.log(paramData, defaultConnectorName);
      setIsModalVisible(false);
      callbackFunc(paramData, FlowMetaType.DECISION)
    }).catch((rejected) => {
      console.log(rejected)
    })
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    callbackFunc(false, FlowMetaType.DECISION)
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
      FormilyFilter
    },
  })
  
  const form = createForm()

  if (decisionData) {
    const flowData = clone(decisionData)
    flowData.rules.forEach((rule: any) => {
      const conditions = rule.criteria?.conditions?.map((data: ICriteriaCondition) => {
        return {
          source: data.fieldPattern,
          op: data.operation,
          type: data.type || opTypeEnum.INPUT,
          target: data.value
        }
      })
      rule.criteria.conditions = conditions
    })
    form.setValues(flowData)
  } else {
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
  }


  // useEffect(() => {
  //   if (decisionData) {
  //     form.setValues(decisionData)
  //   } else {
  //     form.setValues(
  //       {
  //         rules: [{
  //           name: '',
  //           id: uid(),
  //           criteria: {
  //             conditions: [{}],
  //           },
  //           description: '',
  //         }]
  //       }
  //     )
  //   }
  // }, [decisionData, form])

  const descTipHtml = <div className="branch-arrays-tip">
    <p className="name">
      <TextWidget>flow.form.decision.name</TextWidget>
    </p>
    <p className="tip">
      <TextWidget>flow.form.decision.tip</TextWidget>
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
                const message = new RepeatErrorMessage(flowGraph, value, decisionData, apiReg)
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
          rules: {
            type: 'array',
            title: '',
            'x-decorator': 'FormItem',
            'x-component': 'BranchArrays',
            "x-decorator-props": {
              gridSpan: 2,
            },
            'x-component-props': {
              title: <TextWidget>flow.form.decision.title</TextWidget>,
              descTipHtml: descTipHtml,
              addDescription: <TextWidget>flow.form.decision.sortTitle</TextWidget>,
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
                    removeMessage: <TextWidget>flow.form.decision.removeResult</TextWidget>,
                  },
                  properties: {
                    name: {
                      type: 'string',
                      title: <TextWidget>flow.form.comm.label</TextWidget>,
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
                    'criteria.conditions': {
                      // type: 'void',
                      // 'x-component': 'BranchArrays.FormilyFilterBuilder',
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
  )
}
