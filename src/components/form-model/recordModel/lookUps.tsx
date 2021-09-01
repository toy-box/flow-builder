import React, { FC, useState, useEffect, useCallback } from 'react';
import { Modal } from 'antd';
import { Input, FormItem, Select, FormLayout, FormGrid, PreviewText,
  Space, ArrayItems, Switch, Radio, NumberPicker } from '@formily/antd'
import { createForm, onFieldValueChange } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { observer } from '@formily/react'
import { IFieldOption, MetaValueType } from '@toy-box/meta-schema';
import { IFlowResourceType, FlowMetaType, FlowMetaParam } from '../../../flow/types'
import { ResourceSelect, FormilyFilter } from '../../formily/components/index'
import { fieldMetaStore } from '../../../store'
import { uid } from '../../../utils';

export interface RecordLookUpModelPorps {
  showModel: boolean
  callbackFunc: (data: FlowMetaParam | boolean, type: FlowMetaType) => void
  title?: string
}

const TextTemplate = observer((props: any) => {
  return <div>{props.textTemplate}</div>
})

export const RecordLookUpModel: FC<RecordLookUpModelPorps> = ({
  showModel = false,
  callbackFunc,
  title= "新建获取记录"
}) => {
  const [isModalVisible, setIsModalVisible] = useState(showModel);

  
  useEffect(() => {
    setIsModalVisible(showModel);
  }, [showModel]);

  const handleOk = () => {
    console.log(form.values)
    const value = form.values;
    const queriedFields = value?.queriedFields?.map((field: { field: string }) => {
      return field.field;
    })
    const paramData = {
      id: value.id,
      name: value.name,
      connector: {
        targetReference: null,
      },
      registerId: value.registerId,
      criteria: {
        conditions: value?.criteria?.conditions
      },
      outputAssignments: value.outputAssignments,
      outputReference: value.outputReference,
      queriedFields,
      sortOrder: value.sortOrder,
      sortField: value.sortField,
      storeOutputAutomatically: value.storeOutputAutomatically,
      getFirstRecordOnly: value.getFirstRecordOnly
    }
    console.log(paramData);
    form.submit((resolve) => {
      setIsModalVisible(false);
      callbackFunc(paramData, FlowMetaType.RECORD_LOOKUPS)
    }).catch((rejected) => {
    })
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    callbackFunc(false, FlowMetaType.RECORD_LOOKUPS)
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
    },
  })
  
  const form = createForm({
    effects: () => {
      onFieldValueChange('registerId', (field) => {
        const registers = fieldMetaStore.fieldMetaStore.registers
        const register = registers.find((rg) => rg.id === field.value)
        if (register) {
          form.setFieldState('criteria.conditions', (state) => {
            state.title = `筛选 ${register.name} 记录`
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
        const flag = (automaticallyType === true && !outputReference) || (!automaticallyType && outputReference)
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
        const flag = (automaticallyType === true && !outputReference) || (!automaticallyType && outputReference)
        form.setFieldState('queriedFields', (state) => {
          state.value = []
          state.display = flag? 'visible' : 'none'
        })
      })
      onFieldValueChange('outputReference', (field) => {
        const automaticallyType = field.query('automaticallyType').get('value')
        const outputReference = field.value
        const flag = (automaticallyType === true && !outputReference) || (!automaticallyType && outputReference)
        form.setFieldState('queriedFields', (state) => {
          state.value = []
          state.display = flag? 'visible' : 'none'
        })
      })
    }
  })
  form.setValues({
    sortOptions: []
  })

  const myReaction = useCallback((type, field) => {
    const val = form.values
    const sortOrder = val.sortOrder
    if (type === 'sortOrderIsEmpty') {
      field.display = sortOrder === 'null' ? 'visible' : 'none';
    } else {
      field.display = sortOrder === 'asc' || sortOrder === 'desc' ? 'visible' : 'none';
    }
  }, [form.values])

  const reactionField = useCallback((field) => {
    const refObjectId = field.query('registerId').get('value')
    if (!refObjectId) return []
    const registers = fieldMetaStore.fieldMetaStore.registers
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
    console.log(automaticallyType, storeOutputAutomatically, outputReference)
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
            title: '标签',
            required: true,
            'x-validator': {
              required: true,
              message: '标签是必填项'
            },
            'x-decorator': 'FormItem',
            'x-component': 'Input'
          },
          id: {
            type: 'string',
            title: 'API名称',
            required: true,
            'x-validator': {
              required: true,
              message: 'API名称是必填项'
            },
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
          registerId: {
            type: 'string',
            title: '获取对象记录',
            required: true,
            'x-validator': {
              required: true,
              message: '对象记录是必填项'
            },
            'x-decorator': 'FormItem',
            'x-component': 'ResourceSelect',
            'x-component-props': {
              isHiddenResourceBtn: true,
              mataSource: 'metaData',
            },
          },
          web: {
            type: 'void',
            title: '',
            'x-decorator': 'FormItem',
          },
          'criteria.conditions': {
            type: 'number',
            title: '筛选记录',
            required: true,
            'x-validator': {
              required: true,
              message: '筛选记录是必填项'
            },
            'x-decorator': 'FormItem',
            'x-component': 'FormilyFilter',
            "x-decorator-props": {
              gridSpan: 2
            },
            'x-component-props': {
              paramKey: 'criteria.conditions',
              reactionKey: 'registerId',
              mataSource: 'metaData',
              specialMode: true,
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
            title: '排序记录',
            default: 'null',
            enum: [
              {
                label: '升序',
                value: 'asc',
              },
              {
                label: '降序',
                value: 'desc',
              },
              {
                label: '未排序',
                value: 'null',
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
            title: '排序标准',
            'x-decorator': 'FormItem',
            'x-component': 'TextTemplate',
            'x-component-props': {
              textTemplate: '如果您仅存储第一个记录，按唯一字段筛选，例如 ID。',
            },
            'x-reactions': myReaction.bind(this, 'sortOrderIsEmpty'),
          },
          sortField: {
            type: 'string',
            title: '排序标准',
            required: true,
            'x-validator': {
              required: true,
              message: '排序标准是必填项'
            },
            'x-decorator': 'FormItem',
            'x-component': 'ResourceSelect',
            'x-reactions': myReaction.bind(this, 'sortField'),
            'x-component-props': {
              isHiddenResourceBtn: true,
              mataSource: 'metaData',
              reactionKey: 'registerId',
            },
          },
          getFirstRecordOnly: {
            type: 'boolean',
            title: '存储的记录数量',
            default: true,
            enum: [
              {
                label: '仅限第一个记录',
                value: true,
              },
              {
                label: '所有记录',
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
            title: '如何存储记录数据',
            default: true,
            enum: [
              {
                label: '自动存储所有字段',
                value: true,
              },
              {
                label: '手动存储所有字段',
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
            title: '手动存储类型',
            default: true,
            enum: [
              {
                label: '选择字段',
                value: true,
              },
              {
                label: '选择字段并分配变量（高级）',
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
            title: '存储字段值的位置',
            default: true,
            enum: [
              {
                label: '共同在记录变量中',
                value: true,
              },
              {
                label: '在单独变量中',
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
            title: '选择记录变量',
            required: true,
            'x-validator': {
              required: true,
              message: '记录变量是必填项'
            },
            'x-decorator': 'FormItem',
            'x-component': 'ResourceSelect',
            'x-component-props': {
              mataSource: 'flowJson',
              placeholder: '选择记录变量',
              flowJsonTypes: [{ 
                value: IFlowResourceType.VARIABLE,
                label: '记录（单个）变量',
                children: [MetaValueType.OBJECT, MetaValueType.OBJECT_ID]
              }]
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
            title: '选择字段',
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
                title: '添加字段',
                'x-component': 'ArrayItems.Addition',
              },
            },
            'x-reactions': reactionQueriedFields,
          },
          outputAssignments: {
            type: 'number',
            title: '设置字段变量',
            'x-decorator': 'FormItem',
            'x-component': 'FormilyFilter',
            "x-decorator-props": {
              gridSpan: 2
            },
            'x-component-props': {
              simple: true,
              specialMode: false,
              paramKey: 'outputAssignments',
              reactionKey: 'registerId',
              mataSource: 'metaData',
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
