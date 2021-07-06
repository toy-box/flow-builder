import React, { FC, useState } from 'react'
import { FormItem, FormLayout, Input, Select } from '@formily/antd'
import { createForm, onFieldReact, onFieldValueChange } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { Button, Modal } from 'antd'
import { action } from '@formily/reactive'
import { IFlowResourceType } from '../../flow/types'
import { MetaValueType } from '@toy-box/meta-schema';
import { GatherInput } from '../formily/index'

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Select,
    GatherInput,
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
      title: 'api名称',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入名称...'
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
    value: {
      type: 'string',
      title: '默认值',
      'x-decorator': 'FormItem',
      'x-component': 'GatherInput',
      'x-component-props': {
        placeholder: '请输入值...',
        onChange: (value: any) => {
          formData.values.value = value
        },
      },
    },
  },
}

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
    field.display = isShow ? 'visible' : 'none'
    formData.setFieldState('value', (state) => {
      state.display = fieldObj.value ? 'visible' : 'none'
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
      formData.setFieldState('value', (state) => {
        state.value = null
      })
    })
  },
})

export const ResourceCreate:FC<any> = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form, setForm] = useState(formData)

  const showModal = () => {
    formData.values = {}
    formData.clearErrors()
    setForm(formData)
    setIsModalVisible(true);
  };

  const handleOk = () => {
    console.log(formData);
    form.submit((resolve) => {
      setIsModalVisible(false);
    }).catch((rejected) => {
    })
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <div onClick={showModal}>
        <Button>添加资源</Button>
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
