import React, { FC, useState, useEffect, useCallback } from 'react';
import { Modal } from 'antd';
import { Input, FormItem, Select, FormLayout, FormGrid, PreviewText,
  Space, ArrayItems, Switch, Radio, NumberPicker } from '@formily/antd'
import { createForm, onFieldValueChange } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { IFieldOption } from '@toy-box/meta-schema';
import { ResourceSelect } from '../../formily/components/index'
import { IFlowResourceType, FlowMetaType, FlowMetaParam } from '../../../flow/types'
import { fieldMetaStore } from '../../../store'
import { uid } from '../../../utils';
import { TextWidget } from '../../widgets'

export interface SortCollectionPorps {
  showModel: boolean
  callbackFunc: (data: FlowMetaParam | boolean, type: FlowMetaType) => void
  title?: string | JSX.Element
  metaFlowData?: FlowMetaParam
}

interface sortOption {
  sortField: any
  sortOrder: string
  doesPutEmptyStringAndNullFirst: boolean
}

export const SortCollectionModel: FC<SortCollectionPorps> = ({
  showModel = false,
  callbackFunc,
  title= <TextWidget>flow.form.sortCollection.addTitle</TextWidget>,
  metaFlowData
}) => {
  const [isModalVisible, setIsModalVisible] = useState(showModel)
  
  useEffect(() => {
    setIsModalVisible(showModel);
  }, [showModel]);

  const handleOk = () => {
    console.log(form.values)
    form.submit((resolve) => {
      const value = form.values;
      value.sortOptions.forEach((option: sortOption) => {
        if (option.sortField === undefined) option.sortField = null
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
        collectionReference: value.collectionReference,
        limit: value.limitFlag === 'all' ? null : value.limit,
        sortOptions: value.sortOptions
      }
      console.log(paramData);
      setIsModalVisible(false);
      callbackFunc(paramData, FlowMetaType.SORT_COLLECTION_PROCESSOR)
    }).catch((rejected) => {
    })
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    callbackFunc(false, FlowMetaType.SORT_COLLECTION_PROCESSOR)
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
    },
  })
  
  const form = createForm({
    effects: () => {
      onFieldValueChange('collectionReference', (field) => {
        form.setFieldState('sortOptions', (state) => {
          state.value = [{
            sortOrder: 'asc'
          }]
        })
        form.setFieldState('sortOptions[0].sortField', (state) => {
          const value = isRecord(field.value)?.value
          state.display = value === IFlowResourceType.VARIABLE_ARRAY_RECORD ? 'visible' : 'none'
        })
        form.setFieldState('sortOptions[0].remove', (state) => {
          const value = isRecord(field.value)?.value
          state.display = value === IFlowResourceType.VARIABLE_ARRAY_RECORD ? 'visible' : 'none'
        })
        form.setFieldState('sortOptions.addition', (state) => {
          const value = isRecord(field.value)?.value
          state.display = value === IFlowResourceType.VARIABLE_ARRAY_RECORD ? 'visible' : 'none'
        })
      })
      onFieldValueChange('limitFlag', (field) => {
        form.setFieldState('limit', (state) => {
          state.display = field.value === 'all' ? 'none' : 'visible'
          state.value = field.value === 'all' ? null : state.value
        })
      })
    }
  })

  useEffect(() => {
    if (metaFlowData) {
      form.setValues(metaFlowData)
    } else {
      form.setValues({
        sortOptions: []
      })
    }
  }, [form, metaFlowData])

  const isRecord = useCallback((value) => {
    const resourceFieldMetas = fieldMetaStore.fieldMetaStore.fieldMetas as any[]
    const meta = resourceFieldMetas.find((metaData: any) => {
      if (value) {
        const idx = metaData.children.findIndex((data: any) => data.key === value)
        return idx > -1
      }
      return false
    })
    return meta
  }, [])

  const myReaction = useCallback((field) => {
    const flowType = field.query('collectionReference').get('value')
    if (!flowType) return []
    const resourceFieldMetas = fieldMetaStore.fieldMetaStore.fieldMetas as any[]
    let refObjectId: string = ''
    resourceFieldMetas.some((metaData: any) => {
      const idx = metaData.children.findIndex((data: any) => data.key === flowType)
      if (idx > -1) refObjectId = metaData.children[idx].refObjectId
      return idx > -1
    })
    const registers = fieldMetaStore.fieldMetaStore.registers
    let registerOps: IFieldOption[] = []
    registers.some((re) => {
      if (re.id === refObjectId) {
        for (const key in re.properties) {
          if (re.properties.hasOwnProperty(key)) {
            const obj = re.properties[key];
            const value = form.values;
            const idx = value.sortOptions.findIndex((option: sortOption) => option.sortField === obj.key)
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
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.value</TextWidget>
            },
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
            title: <TextWidget>flow.form.sortCollection.collectionReference</TextWidget>,
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
              }]
            },
          },
          web: {
            type: 'string',
            title: '',
            'x-decorator': 'FormItem',
          },
          sortOptions: {
            type: 'array',
            required: true,
            maxItems: 3,
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.sortOptions</TextWidget>
            },
            'x-component': 'ArrayItems',
            'x-decorator': 'FormItem',
            "x-decorator-props": {
              gridSpan: 2
            },
            title: '',
            'x-reactions': {
              dependencies: ['collectionReference'],
              fulfill: {
                schema: {
                  'x-display': "{{$deps != '' ? 'visible' : 'none'}}",
                },
              },
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
                  },
                  properties: {
                    space: {
                      type: 'void',
                      'x-component': 'Space',
                      properties: {
                        sortField: {
                          type: 'string',
                          title: <TextWidget>flow.form.sortCollection.sortField</TextWidget>,
                          required: true,
                          'x-validator': {
                            required: true,
                            message: <TextWidget>flow.form.validator.sortField</TextWidget>
                          },
                          'x-decorator': 'FormItem',
                          'x-component': 'Select',
                          'x-component-props': {
                            style: {
                              width: 250,
                            },
                          },
                          "x-reactions": myReaction
                        },
                        sortOrder: {
                          type: 'string',
                          title: <TextWidget>flow.form.sortCollection.sortOrder</TextWidget>,
                          default: 'asc',
                          enum: [
                            {
                              label: <TextWidget>flow.form.sortCollection.sortOrderOption.asc</TextWidget>,
                              value: 'asc',
                            },
                            {
                              label: <TextWidget>flow.form.sortCollection.sortOrderOption.desc</TextWidget>,
                              value: 'desc',
                            },
                          ],
                          'x-decorator': 'FormItem',
                          'x-component': 'Select',
                          'x-component-props': {
                            style: {
                              width: 250,
                            },
                          },
                        },
                        doesPutEmptyStringAndNullFirst: {
                          type: 'boolean',
                          title: <TextWidget>flow.form.sortCollection.doesPutEmptyStringAndNullFirst</TextWidget>,
                          'x-decorator': 'FormItem',
                          'x-component': 'Switch',
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
              },
            },
            properties: {
              add: {
                type: 'void',
                title: <TextWidget>flow.form.sortCollection.addSortItem</TextWidget>,
                'x-component': 'ArrayItems.Addition',
              },
            },
          },
          limitFlag: {
            type: 'string',
            title: <TextWidget>flow.form.sortCollection.limitFlag</TextWidget>,
            required: true,
            default: 'all',
            enum: [
              {
                label: <TextWidget>flow.form.sortCollection.limitFlagOption.all</TextWidget>,
                value: 'all',
              },
              {
                label: <TextWidget>flow.form.sortCollection.limitFlagOption.count</TextWidget>,
                value: 'count',
              },
            ],
            'x-decorator': 'FormItem',
            'x-component': 'Radio.Group',
          },
          limit: {
            type: 'number',
            title: <TextWidget>flow.form.sortCollection.limit</TextWidget>,
            required: true,
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.limit</TextWidget>
            },
            'x-decorator': 'FormItem',
            'x-component': 'NumberPicker',
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
