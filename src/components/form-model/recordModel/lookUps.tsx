/* eslint-disable react-hooks/rules-of-hooks */
import React, { FC, useState, useEffect, useCallback } from 'react';
import { Modal } from 'antd';
import { Input, FormItem, Select, FormLayout, FormGrid, PreviewText,
  Space, ArrayItems, Switch, Radio, NumberPicker } from '@formily/antd'
import { createForm, onFieldValueChange } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { observer } from '@formily/react'
import { IFieldOption, MetaValueType, ICompareOperation } from '@toy-box/meta-schema';
import {
  ArrowRightOutlined,
} from '@ant-design/icons'
import { clone } from '@toy-box/toybox-shared';
import { IFlowResourceType, FlowMetaType, FlowMetaParam, ICriteriaCondition, opTypeEnum } from '../../../flow/types'
import { ResourceSelect, FormilyFilter } from '../../formily/components/index'
// import { uid } from '../../../utils';
import { TextWidget } from '../../widgets'
import { useLocale } from '../../../hooks'
import { AutoFlow } from '../../../flow/models/AutoFlow'
import { RepeatErrorMessage } from '../RepeatErrorMessage'

export interface RecordLookUpModelPorps {
  showModel: boolean
  callbackFunc: (data: FlowMetaParam | boolean, type: FlowMetaType) => void
  title?: string | JSX.Element
  metaFlowData?: FlowMetaParam
  flowGraph: AutoFlow,
}

const TextTemplate = observer((props: any) => {
  return <div>{props.textTemplate}</div>
})

export const RecordLookUpModel: FC<RecordLookUpModelPorps> = ({
  showModel = false,
  callbackFunc,
  title= <TextWidget>flow.form.recordLookUp.addTitle</TextWidget>,
  metaFlowData,
  flowGraph
}) => {
  const [isModalVisible, setIsModalVisible] = useState(showModel);
  const filterName = useLocale('flow.form.recordLookUp.filter')
  const record = useLocale('flow.form.recordLookUp.record')
  const repeatName = useLocale('flow.form.validator.repeatName')

  
  useEffect(() => {
    setIsModalVisible(showModel);
  }, [showModel]);

  const handleOk = () => {
    console.log(form.values)
    const value = form.values;
    const queriedFields = value?.queriedFields?.map((field: { field: string }) => {
      return field.field;
    })
    const conditions = value?.criteria?.conditions?.map((data: ICompareOperation) => {
      return {
        fieldPattern: data.source,
        operation: data.op,
        type: data.type || opTypeEnum.INPUT,
        value: data.target
      }
    })
    // const outputAssignments = value?.outputAssignments?.map((data: ICompareOperation) => {
    //   return {
    //     assignToReference: data.source,
    //     field: data.target
    //   }
    // })
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
      criteria: conditions && conditions.length > 0 ? {
        conditions,
        logic: '$and'
      } : null,
      outputAssignments: value?.outputAssignments,
      outputReference: value.address ? value.outputReference: undefined,
      queriedFields,
      sortOrder: value.sortOrder,
      sortField: value.sortField,
      storeOutputAutomatically: value.storeOutputAutomatically,
      getFirstRecordOnly: value.getFirstRecordOnly
    }
    console.log(paramData);
    form.submit((resolve) => {
      setIsModalVisible(false);
      callbackFunc(paramData, FlowMetaType.RECORD_LOOKUP)
    }).catch((rejected) => {
    })
  };

  const ArrowRightOutlinedIcon = () => {
    return <ArrowRightOutlined style={ {position: 'relative',
      top: '-10px',
      fontSize: '18px'}} />
  }

  const handleCancel = () => {
    setIsModalVisible(false);
    callbackFunc(false, FlowMetaType.RECORD_LOOKUP)
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
      TextTemplate,
      ArrowRightOutlinedIcon,
    },
  })
  
  const form = createForm({
    effects: () => {
      onFieldValueChange('registerId', (field) => {
        const registers = flowGraph.registers
        const register = registers.find((rg) => rg.id === field.value)
        if (register) {
          form.setFieldState('criteria.conditions', (state) => {
            state.title = `${filterName} ${register.name} ${record}`
            state.value = []
          })
          form.setFieldState('sortOrder', (state) => {
            state.value = null
          })
          form.setFieldState('sortField', (state) => {
            state.value = undefined
          })
          form.setFieldState('storeOutputAutomatically', (state) => {
            state.value = true
          })
        }
      })
      onFieldValueChange('storeOutputAutomatically', (field) => {
        form.setFieldState('automaticallyType', (state) => {
          state.value = !field.value ? true : undefined
        })
        form.setFieldState('outputReference', (state) => {
          state.value = undefined
        })
        form.setFieldState('queriedFields', (state) => {
          state.value = undefined
        })
      })
      onFieldValueChange('automaticallyType', (field) => {
        const automaticallyType = field.value
        const outputReference = field.query('outputReference').get('value')
        const flag = (automaticallyType === true) || (!automaticallyType && outputReference)
        form.setFieldState('outputReference', (state) => {
          state.value = undefined
        })
        form.setFieldState('queriedFields', (state) => {
          state.value = []
          state.display = flag? 'visible' : 'none'
        })
      })
      onFieldValueChange('address', (field) => {
        form.setFieldState('outputReference', (state) => {
          state.value = undefined
        })
        const automaticallyType = field.query('automaticallyType').get('value')
        const outputReference = field.query('outputReference').get('value')
        const flag = (automaticallyType === true) || (!automaticallyType && outputReference)
        form.setFieldState('queriedFields', (state) => {
          // state.value = []
          state.display = flag? 'visible' : 'none'
        })
      })
      onFieldValueChange('outputReference', (field) => {
        const automaticallyType = field.query('automaticallyType').get('value')
        const outputReference = field.value
        const flag = (automaticallyType === true) || (!automaticallyType && outputReference)
        form.setFieldState('queriedFields', (state) => {
          state.value = []
          state.display = flag? 'visible' : 'none'
        })
      })
    }
  })

  if (metaFlowData) {
    const flowData = clone(metaFlowData)
    const conditions = flowData?.criteria?.conditions?.map((data: ICriteriaCondition) => {
      return {
        source: data.fieldPattern,
        op: data.operation,
        type: data.type || opTypeEnum.INPUT,
        target: data.value
      }
    })
    // const outputAssignments = flowData?.outputAssignments?.map((data: IOutputAssignment) => {
    //   return {
    //     source: data.assignToReference,
    //     op: CompareOP.EQ,
    //     type: 'REFERENCE',
    //     target: data.field
    //   }
    // })
    if (flowData?.criteria?.conditions) {
      flowData.criteria.conditions = conditions
    } else if (!flowData?.criteria) {
      flowData.criteria = {}
    }
    if (flowData.queriedFields && !flowData.outputReference) {
      flowData.automaticallyType = true
    } else {
      flowData.automaticallyType = false
      if (!flowData.outputReference) {
        flowData.address = false
      } else {
        flowData.address = true
      }
    }
    const queriedFields = flowData?.queriedFields?.map((field: string) => {
      return {
        field: field
      }
    })
    flowData.queriedFields = queriedFields
    // flowData.outputAssignments = outputAssignments
    form.initialValues = flowData
  }

  const myReaction = useCallback((type, field) => {
    const val = form.values
    const sortOrder = val.sortOrder
    if (type === 'sortOrderIsEmpty') {
      field.display = sortOrder === null ? 'visible' : 'none';
    } else {
      field.display = sortOrder === 'asc' || sortOrder === 'desc' ? 'visible' : 'none';
    }
  }, [form.values])

  const reactionField = useCallback((field) => {
    const refObjectId = field.query('registerId').get('value')
    if (!refObjectId) return []
    const registers = flowGraph.registers
    let registerOps: IFieldOption[] = []
    registers.some((re) => {
      if (re.id === refObjectId) {
        for (const key in re.properties) {
          if (re.properties.hasOwnProperty(key)) {
            const obj = re.properties[key];
            const value = form.values;
            const idx = value?.queriedFields?.findIndex((option: any) => option.field === obj.key)
            const option = {
              label: obj.name,
              value: obj.key,
              disabled: idx > -1,
            }
            registerOps.push(option)
          }
        }
        return true
      }
      return false
    })
    field.dataSource = registerOps
  }, [form.values])

  const reactionQueriedFields = useCallback((field) => {
    const automaticallyType = form.values.automaticallyType
    const storeOutputAutomatically = field.query('storeOutputAutomatically').get('value')
    const outputReference = field.query('outputReference').get('value')
    field.display = (storeOutputAutomatically === false && automaticallyType !== false) || outputReference ? 'visible' : 'none'
  }, [form.values.automaticallyType])

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
            title: <TextWidget>flow.form.recordLookUp.registerId</TextWidget>,
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
            type: 'void',
            title: '',
            'x-decorator': 'FormItem',
          },
          'criteria.conditions': {
            type: 'number',
            title: <TextWidget>flow.form.recordLookUp.conditions</TextWidget>,
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
          sortOrder: {
            type: 'string',
            title: <TextWidget>flow.form.recordLookUp.sortOrder</TextWidget>,
            default: null,
            enum: [
              {
                label: <TextWidget>flow.form.recordLookUp.sortOrderOption.asc</TextWidget>,
                value: 'asc',
              },
              {
                label: <TextWidget>flow.form.recordLookUp.sortOrderOption.desc</TextWidget>,
                value: 'desc',
              },
              {
                label: <TextWidget>flow.form.recordLookUp.sortOrderOption.no</TextWidget>,
                value: null,
              },
            ],
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            'x-reactions': {
              dependencies: ['registerId'],
              fulfill: {
                schema: {
                  'x-display': "{{$deps != '' ? 'visible' : 'none'}}",
                },
              },
            },
          },
          sortOrderIsEmpty: {
            type: 'string',
            title: <TextWidget>flow.form.recordLookUp.sortField</TextWidget>,
            'x-decorator': 'FormItem',
            'x-component': 'TextTemplate',
            'x-component-props': {
              textTemplate: <TextWidget>flow.form.recordLookUp.textTemplate</TextWidget>,
            },
            'x-reactions': myReaction.bind(this, 'sortOrderIsEmpty'),
          },
          sortField: {
            type: 'string',
            title: <TextWidget>flow.form.recordLookUp.sortField</TextWidget>,
            required: true,
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.sortOrderIsEmpty</TextWidget>
            },
            'x-decorator': 'FormItem',
            'x-component': 'ResourceSelect',
            'x-reactions': myReaction.bind(this, 'sortField'),
            'x-component-props': {
              isHiddenResourceBtn: true,
              mataSource: 'metaData',
              reactionKey: 'registerId',
              flowGraph,
            },
          },
          getFirstRecordOnly: {
            type: 'boolean',
            title: <TextWidget>flow.form.recordLookUp.getFirstRecordOnly</TextWidget>,
            default: true,
            enum: [
              {
                label: <TextWidget>flow.form.recordLookUp.getFirstRecordOnlyOp.first</TextWidget>,
                value: true,
              },
              {
                label: <TextWidget>flow.form.recordLookUp.getFirstRecordOnlyOp.all</TextWidget>,
                value: false,
              },
            ],
            'x-decorator': 'FormItem',
            'x-component': 'Radio.Group',
            "x-decorator-props": {
              gridSpan: 2
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
          storeOutputAutomatically: {
            type: 'boolean',
            title: <TextWidget>flow.form.recordLookUp.storeOutputAutomatically</TextWidget>,
            default: true,
            enum: [
              {
                label: <TextWidget>flow.form.recordLookUp.storeOutputAutomaticallyOp.auto</TextWidget>,
                value: true,
              },
              {
                label: <TextWidget>flow.form.recordLookUp.storeOutputAutomaticallyOp.people</TextWidget>,
                value: false,
              },
            ],
            'x-decorator': 'FormItem',
            'x-component': 'Radio.Group',
            "x-decorator-props": {
              gridSpan: 2
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
          automaticallyType: {
            type: 'boolean',
            title: <TextWidget>flow.form.recordLookUp.automaticallyType</TextWidget>,
            default: true,
            enum: [
              {
                label: <TextWidget>flow.form.recordLookUp.automaticallyTypeOp.select</TextWidget>,
                value: true,
              },
              {
                label: <TextWidget>flow.form.recordLookUp.automaticallyTypeOp.selectPro</TextWidget>,
                value: false,
              },
            ],
            'x-decorator': 'FormItem',
            'x-component': 'Radio.Group',
            "x-decorator-props": {
              gridSpan: 2
            },
            'x-reactions': {
              dependencies: ['storeOutputAutomatically'],
              fulfill: {
                schema: {
                  'x-display': "{{$deps == 'false' ? 'visible' : 'none'}}",
                },
              },
            },
          },
          address: {
            type: 'boolean',
            title: <TextWidget>flow.form.recordLookUp.address</TextWidget>,
            default: true,
            enum: [
              {
                label: <TextWidget>flow.form.recordLookUp.addressOption.comm</TextWidget>,
                value: true,
              },
              {
                label: <TextWidget>flow.form.recordLookUp.addressOption.one</TextWidget>,
                value: false,
              },
            ],
            'x-decorator': 'FormItem',
            'x-component': 'Radio.Group',
            "x-decorator-props": {
              gridSpan: 2
            },
            'x-reactions': {
              dependencies: ['automaticallyType'],
              fulfill: {
                schema: {
                  'x-display': "{{$deps == 'false' ? 'visible' : 'none'}}",
                },
              },
            },
          },
          outputReference: {
            type: 'string',
            title: <TextWidget>flow.form.recordLookUp.outputReference</TextWidget>,
            required: true,
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.outputReference</TextWidget>
            },
            'x-decorator': 'FormItem',
            'x-component': 'ResourceSelect',
            'x-component-props': {
              mataSource: 'flowJson',
              placeholder: <TextWidget>flow.form.placeholder.outputReference</TextWidget>,
              flowJsonTypes: [{ 
                value: IFlowResourceType.VARIABLE_RECORD,
                label: <TextWidget>flow.form.recordLookUp.outputReferenceLabel</TextWidget>,
                children: [IFlowResourceType.VARIABLE_RECORD, IFlowResourceType.VARIABLE_ARRAY_RECORD]
              }],
              flowGraph,
            },
            'x-reactions': {
              dependencies: ['address'],
              fulfill: {
                schema: {
                  'x-display': "{{$deps == 'true' ? 'visible' : 'none'}}",
                },
              },
            },
          },
          web1: {
            type: 'void',
            title: '',
            'x-decorator': 'FormItem',
            'x-reactions': {
              dependencies: ['address'],
              fulfill: {
                schema: {
                  'x-display': "{{$deps == 'true' ? 'visible' : 'none'}}",
                },
              },
            },
          },
          queriedFields: {
            type: 'array',
            'x-component': 'ArrayItems',
            'x-decorator': 'FormItem',
            title: <TextWidget>flow.form.recordLookUp.queriedFields</TextWidget>,
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.queriedFields</TextWidget>
            },
            required: true,
            items: {
              type: 'object',
              properties: {
                space: {
                  type: 'void',
                  'x-component': 'Space',
                  properties: {
                    field: {
                      type: 'string',
                      title: '',
                      'x-decorator': 'FormItem',
                      'x-component': 'Select',
                      'x-reactions': reactionField,
                      'x-component-props': {
                        style: {
                          width: 350,
                        },
                      },
                    },
                    remove: {
                      type: 'void',
                      'x-decorator': 'FormItem',
                      'x-component': 'ArrayItems.Remove',
                    },
                  },
                },
              },
            },
            properties: {
              add: {
                type: 'void',
                title: <TextWidget>flow.form.recordLookUp.addField</TextWidget>,
                'x-component': 'ArrayItems.Addition',
              },
            },
            'x-reactions': reactionQueriedFields,
          },
          outputAssignments: {
            type: 'array',
            'x-component': 'ArrayItems',
            'x-decorator': 'FormItem',
            title: <TextWidget>flow.form.recordLookUp.outputAssignments</TextWidget>,
            "x-decorator-props": {
              gridSpan: 2
            },
            items: {
              type: 'object',
              properties: {
                space: {
                  type: 'void',
                  'x-component': 'Space',
                  properties: {
                    assignToReference: {
                      type: 'string',
                      title: '',
                      'x-decorator': 'FormItem',
                      'x-component': 'Select',
                      'x-reactions': reactionField,
                      'x-component-props': {
                        style: {
                          width: 300,
                        },
                      },
                    },
                    icon: {
                      type: 'string',
                      title: '',
                      // 'x-decorator': 'FormItem',
                      'x-component': 'ArrowRightOutlinedIcon',
                    },
                    field: {
                      type: 'string',
                      title: '',
                      'x-decorator': 'FormItem',
                      'x-component': 'ResourceSelect',
                      'x-component-props': {
                        isHiddenResourceBtn: true,
                        flowGraph,
                        style: {
                          width: 300,
                        },
                      },
                    },
                    remove: {
                      type: 'void',
                      'x-decorator': 'FormItem',
                      'x-component': 'ArrayItems.Remove',
                    },
                  },
                },
              },
            },
            properties: {
              add: {
                type: 'void',
                title: <TextWidget>flow.form.recordLookUp.addField</TextWidget>,
                'x-component': 'ArrayItems.Addition',
                'x-component-props': {
                  style: {
                    width: 150,
                  },
                },
              },
            },
            'x-reactions': {
              dependencies: ['address'],
              fulfill: {
                schema: {
                  'x-display': "{{$deps == 'false' ? 'visible' : 'none'}}",
                },
              },
            },
          },
          // outputAssignments: {
          //   type: 'number',
          //   title: <TextWidget>flow.form.recordLookUp.outputAssignments</TextWidget>,
          //   'x-decorator': 'FormItem',
          //   'x-component': 'FormilyFilter',
          //   "x-decorator-props": {
          //     gridSpan: 2
          //   },
          //   'x-component-props': {
          //     simple: true,
          //     specialMode: true,
          //     specialShowTypes: ['REFERENCE'],
          //     reactionKey: 'registerId',
          //     mataSource: 'metaData',
          //     flowGraph,
          //   },
          //   'x-reactions': {
          //     dependencies: ['address'],
          //     fulfill: {
          //       schema: {
          //         'x-display': "{{$deps == 'false' ? 'visible' : 'none'}}",
          //       },
          //     },
          //   },
          // },
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
