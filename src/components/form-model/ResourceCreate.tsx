import React, { FC, useState } from 'react'
import { FormItem, FormLayout, Input, Select } from '@formily/antd'
import { createForm, onFieldReact, onFieldValueChange } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { Button, Modal } from 'antd'
import { action } from '@formily/reactive'
import { IFlowResourceType } from '../../flow/types'
import { MetaValueType, ICompareOperation } from '@toy-box/meta-schema';
import { GatherInput } from '../formily/index'
import { FormulaEdit, BraftEditorTemplate } from '../formily/components'
import { uid } from '../../utils'

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Select,
    GatherInput,
    FormulaEdit,
    BraftEditorTemplate,
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
  value: MetaValueType.OBJECT,
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

interface ResourceCreateProps {
  submit: (value: any) => void
  fieldMetas?: ICompareOperation[] 
}

export const ResourceCreate:FC<ResourceCreateProps> = ({
  submit,
  fieldMetas = [],
}) => {
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
      formData.setFieldState('defaultValue', (state) => {
        const valFlag = fieldObj.value && fieldObj.value !== MetaValueType.MULTI_OPTION
          && fieldObj.value !== MetaValueType.SINGLE_OPTION;
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
          console.log(111111111)
          state.value = null
        })
      })
    },
  })

  const schema = {
    type: 'object',
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
          { label: '变量', value: IFlowResourceType.VARIABLE },
          { label: '常量', value: IFlowResourceType.CONSTANT },
          { label: '公式', value: IFlowResourceType.FORMULA },
          { label: '文本模板', value: IFlowResourceType.TEMPLATE },
        ],
        'x-component-props': {
          placeholder: '请选择...'
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
      },
      description: {
        type: 'string',
        title: '描述',
        'x-decorator': 'FormItem',
        'x-component': 'Input.TextArea',
        "x-component-props": {
          placeholder: '请输入描述...'
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
      defaultValue: {
        type: 'string',
        title: '默认值',
        'x-decorator': 'FormItem',
        'x-component': 'GatherInput',
        'x-component-props': {
          placeholder: '请输入值...',
          options: [{
            label: '默认记录',
            value: 'record',
          }],
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
      text: obj.text,
      expression: obj.expression,
    }
    form.submit((resolve) => {
      setIsModalVisible(false);
      submit(resourceData)
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
