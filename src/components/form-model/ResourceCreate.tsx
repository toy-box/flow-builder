import React, { FC, useCallback, useState } from 'react'
import { FormItem, FormLayout, Input, Select, Checkbox, FormGrid } from '@formily/antd'
import { createForm, onFieldReact, onFieldValueChange } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { Button, Modal } from 'antd'
import { action } from '@formily/reactive'
import { MetaValueType, ICompareOperation } from '@toy-box/meta-schema';
import { clone } from '@formily/shared';
import update from 'immutability-helper'
import { IFlowResourceType } from '../../flow/types'
import { GatherInput } from '../formily/index'
import { FormulaEdit, BraftEditorTemplate } from '../formily/components'
import { uid } from '../../utils'
import { fieldMetaStore } from '../../store'

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Select,
    GatherInput,
    FormulaEdit,
    BraftEditorTemplate,
    Checkbox,
    FormGrid,
  },
})

const metaDataOps = [{
  value: MetaValueType.TEXT,
  label: '文本',
}, {
  value: MetaValueType.STRING,
  label: '字符串',
}, {
  value: MetaValueType.NUMBER,
  label: '数字',
}, {
  value: MetaValueType.OBJECT_ID,
  label: '记录',
}, {
  value: MetaValueType.BOOLEAN,
  label: '布尔值',
}, {
  value: MetaValueType.DATE,
  label: '日期',
}, {
  value: MetaValueType.DATETIME,
  label: '日期/时间',
}, {
  value: MetaValueType.SINGLE_OPTION,
  label: '单选列表',
}, {
  value: MetaValueType.MULTI_OPTION,
  label: '多选列表',
}]

const constMetaOps = [
  MetaValueType.TEXT,
  MetaValueType.STRING,
  MetaValueType.NUMBER,
  MetaValueType.BOOLEAN,
  MetaValueType.DATE,
]

const formulaMetaOps = [
  MetaValueType.TEXT,
  MetaValueType.STRING,
  MetaValueType.NUMBER,
  MetaValueType.BOOLEAN,
  MetaValueType.DATE,
  MetaValueType.DATETIME,
]

const labelNames: any = {
  [IFlowResourceType.VARIABLE]: '变量',
  [IFlowResourceType.VARIABLE_ARRAY]: '集合变量',
  [IFlowResourceType.VARIABLE_ARRAY_RECORD]: '记录集合变量',
  [IFlowResourceType.CONSTANT]: '常量',
  [IFlowResourceType.FORMULA]: '公式',
  [IFlowResourceType.TEMPLATE]: '文本模板',
}

interface ResourceCreateProps {
  fieldMetas?: ICompareOperation[] 
}

export const ResourceCreate:FC<ResourceCreateProps> = ({
  fieldMetas = [],
}) => {
  const { updateFieldMetas } = fieldMetaStore.fieldMetaStore;
  const useAsyncDataSource = (
    pattern: Formily.Core.Types.FormPathPattern,
    service: (
      field: Formily.Core.Models.Field
    ) => Promise<{ label: string; value: any }[]>
  ) => {
    onFieldReact(pattern, (field) => {
      const fieldObj = field as any
      fieldObj.loading = true
      const flowTypeValue = field.query('flowType').value()
      const isShow = flowTypeValue && flowTypeValue !== IFlowResourceType.TEMPLATE
      const isShowDefault = flowTypeValue === IFlowResourceType.VARIABLE || flowTypeValue === IFlowResourceType.CONSTANT
      field.display = isShow ? 'visible' : 'none'
      const valueType = field.query('valueType').value()
      formData.setFieldState('defaultValue', (state) => {
        const valFlag = !valueType && fieldObj.value && fieldObj.value !== MetaValueType.MULTI_OPTION
          && fieldObj.value !== MetaValueType.SINGLE_OPTION && fieldObj.value !== MetaValueType.OBJECT_ID;
        state.display = isShowDefault && valFlag ? 'visible' : 'none'
      })
      service(fieldObj).then(
        action((data) => {
          fieldObj.dataSource = data
          fieldObj.inputValue = null
          fieldObj.loading = false
        })
      )
    })
  }

  const formData = createForm({
    effects: () => {
      onFieldValueChange('flowType', (field) => {
        formData.setFieldState('type', (state) => {
          state.value = null
        })
        formData.setFieldState('text', (state) => {
          state.display = field.value === IFlowResourceType.TEMPLATE ? 'visible' : 'none'
        })
        formData.setFieldState('expression', (state) => {
          state.display = field.value === IFlowResourceType.FORMULA ? 'visible' : 'none'
        })
      })
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useAsyncDataSource('type', async (field) => {
        const flowType = field.query('flowType').get('value')
        if (!flowType) return []
        return new Promise((resolve) => {
          switch (flowType) {
            case IFlowResourceType.VARIABLE:
              return resolve(metaDataOps);
            case IFlowResourceType.CONSTANT:
              const ops = constMetaOps.map((op) => {
                return metaDataOps.find((metaData) => metaData.value === op) 
              });
              return resolve(ops as any[]);
            case IFlowResourceType.FORMULA:
              const Fops = formulaMetaOps.map((op) => {
                return metaDataOps.find((metaData) => metaData.value === op) 
              });
              return resolve(Fops as any[]);
            default:
              return resolve([]);
          }
        })
      })
      onFieldValueChange('type', (field) => {
        formData.setFieldState('defaultValue', (state) => {
          state.value = null
        })
      })
    },
  })

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
          flowType: {
            type: 'string',
            title: '资源类型',
            required: true,
            'x-validator': {
              required: true,
              message: '资源类型是必填项'
            },
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            enum: [
              { label: labelNames[IFlowResourceType.VARIABLE], value: IFlowResourceType.VARIABLE },
              { label: labelNames[IFlowResourceType.CONSTANT], value: IFlowResourceType.CONSTANT },
              { label: labelNames[IFlowResourceType.FORMULA], value: IFlowResourceType.FORMULA },
              { label: labelNames[IFlowResourceType.TEMPLATE], value: IFlowResourceType.TEMPLATE },
            ],
            'x-component-props': {
              placeholder: '请选择...'
            },
            "x-decorator-props": {
              gridSpan: 2
            },
          },
          name: {
            type: 'string',
            title: '资源名称',
            required: true,
            'x-validator': [{
              triggerType: 'onBlur',
              required: true,
              message: '资源名称是必填项',
            }, {
              triggerType: 'onBlur',
              validator: (value: string) => {
                if (!value) return null
                const idx = fieldMetas?.findIndex((meta: any) => meta.name === value)
                if(idx > -1) return '资源名称重复'
              }
            }],
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-component-props': {
              placeholder: '请输入名称...',
            },
            "x-decorator-props": {
              gridSpan: 2
            },
          },
          description: {
            type: 'string',
            title: '描述',
            'x-decorator': 'FormItem',
            'x-component': 'Input.TextArea',
            "x-component-props": {
              placeholder: '请输入描述...'
            },
            "x-decorator-props": {
              gridSpan: 2
            },
          },
          type: {
            type: 'string',
            title: '数据类型',
            required: true,
            'x-validator': {
              required: true,
              message: '数据类型是必填项'
            },
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            'x-component-props': {
              placeholder: '请选择数据类型...'
            },
          },
          valueType: {
            type: 'boolean',
            title: '集合',
            enum: [
              {
                label: '允许多个值（集合）',
                value: 'array',
              },
            ],
            'x-decorator': 'FormItem',
            'x-component': 'Checkbox.Group',
            'x-reactions': {
              dependencies: ['flowType'],
              fulfill: {
                schema: {
                  'x-display': "{{$deps == 'variable' ? 'visible' : 'none'}}",
                },
              },
            },
          },
          refObjectId: {
            type: 'string',
            title: '对象',
            required: true,
            'x-validator': {
              required: true,
              message: '对象值是必填项'
            },
            'x-decorator': 'FormItem',
            'x-component': 'GatherInput',
            'x-component-props': {
              placeholder: '请输入值...',
            },
            "x-decorator-props": {
              gridSpan: 1
            },
            'x-reactions': {
              dependencies: ['type'],
              fulfill: {
                schema: {
                  'x-display': "{{$deps == 'objectId' ? 'visible' : 'none'}}",
                },
              },
            },
          },
          defaultValue: {
            type: 'string',
            title: '默认值',
            'x-decorator': 'FormItem',
            'x-component': 'GatherInput',
            'x-component-props': {
            },
            "x-decorator-props": {
              gridSpan: 2
            },
          },
          text: {
            type: 'string',
            title: '模板',
            required: true,
            'x-disabled': true,
            'x-validator': {
              required: true,
              message: '模板是必填项'
            },
            'x-visible': false,
            'x-decorator': 'FormItem',
            'x-component': 'BraftEditorTemplate',
            'x-component-props': {
            },
            "x-decorator-props": {
              gridSpan: 2
            },
          },
          expression: {
            type: 'string',
            title: '公式',
            required: true,
            'x-validator': {
              required: true,
              message: '公式是必填项'
            },
            'x-visible': false,
            'x-decorator': 'FormItem',
            'x-component': 'FormulaEdit',
            'x-component-props': {
            },
            "x-decorator-props": {
              gridSpan: 2
            },
          },
        },
      },
    },
  }

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form, setForm] = useState(formData)

  const showModal = () => {
    formData.values = {}
    formData.clearErrors()
    setForm(formData)
    setIsModalVisible(true);
  };

  const submitResource = useCallback(
    (resourceData, flowDataType) => {
      let metaIndex = -1
      if (resourceData.type === 'array') {
        if (resourceData.items.type === 'object' || resourceData.items.type  === 'objectId') {
          metaIndex = fieldMetas.findIndex((meta: any) => meta.value === (flowDataType + '_array_record'))
        } else {
          metaIndex = fieldMetas.findIndex((meta: any) => meta.value === (flowDataType + '_array'))
        }
      } else {
        metaIndex = fieldMetas.findIndex((meta: any) => meta.value === flowDataType)
      }
      console.log(flowDataType, metaIndex)
      if (metaIndex > -1) {
        const fieldMeta: any = fieldMetas[metaIndex]
        fieldMeta.children.push(resourceData);
        updateFieldMetas(update(clone(fieldMetas), { [metaIndex]: { $set: fieldMeta } }))
      } else {
        let type = flowDataType + '_array'
        if (resourceData.items.type === 'object' || resourceData.items.type === 'objectId') type = flowDataType + '_array_record'
        const metaData = {
          label: resourceData.type === 'array' ? labelNames[type] : labelNames[flowDataType],
          value: resourceData.type === 'array' ? type : flowDataType,
          children: [resourceData]
        }
        updateFieldMetas(update(clone(fieldMetas as any), { $push: [metaData] }))
      }
    },
    [fieldMetas, updateFieldMetas]
  )

  const handleOk = () => {
    const obj: any = form.values;
    const resourceData: any = {
      description: obj.description,
      exclusiveMaximum: null,
      exclusiveMinimum: null,
      format: null,
      key: uid(),
      maxLength: null,
      maximum: null,
      minLength: null,
      minimum: null,
      name: obj.name,
      options: null,
      pattern: null,
      primary: null,
      properties: null,
      required: null,
      type: obj.type,
      defaultValue: obj.defaultValue,
      refObjectId: obj.refObjectId,
      text: obj.text,
      expression: obj.expression,
    }
    if (obj.valueType) {
      resourceData.type = 'array'
      resourceData.items = { type: obj.type }
    }
    const flowDataType = obj.flowType
    form.submit((resolve) => {
      setIsModalVisible(false);
      submitResource(resourceData, flowDataType)
    }).catch((rejected) => {
    })
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <div>
        <Button onClick={showModal} size="small">添加资源</Button>
      </div>
      <Modal width={900} title="添加资源" visible={isModalVisible} cancelText="取消" okText="确认" onOk={handleOk} onCancel={handleCancel}>
        <FormLayout layout='vertical' colon={false}>
          <FormProvider form={form}>
            <SchemaField schema={schema} />
          </FormProvider>
        </FormLayout>
      </Modal>
    </>
  )
}
