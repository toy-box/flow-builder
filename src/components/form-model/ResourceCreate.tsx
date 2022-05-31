import React, { FC, useCallback, useState } from 'react'
import { FormItem, FormLayout, Input, Select, Checkbox, FormGrid } from '@formily/antd'
import { createForm, onFieldReact, onFieldValueChange, FormPathPattern, Field } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { Button, Modal } from 'antd'
import { action } from '@formily/reactive'
import { MetaValueType, ICompareOperation, IFieldMeta } from '@toy-box/meta-schema';
import { clone } from '@formily/shared';
import { RepeatErrorMessage } from './RepeatErrorMessage'
// import update from 'immutability-helper'
import { IFlowResourceType, IFieldMetaFlow} from '../../flow/types'
import { GatherInput } from '../formily/index'
import { FormulaEdit, BraftEditorTemplate } from '../formily/components'
// import { uid } from '../../utils'
import { TextWidget } from '../widgets'
import { useLocale } from '../../hooks'
import { AutoFlow } from '../../flow/models/AutoFlow'
import { apiReg } from './interface'

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
  value: MetaValueType.STRING,
  label: <TextWidget>flow.metaType.str</TextWidget>,
}, {
  value: MetaValueType.NUMBER,
  label: <TextWidget>flow.metaType.num</TextWidget>,
}, {
  value: MetaValueType.OBJECT,
  label: <TextWidget>flow.metaType.objectId</TextWidget>,
}, {
  value: MetaValueType.TEXT,
  label: <TextWidget>flow.metaType.text</TextWidget>,
}, {
  value: MetaValueType.BOOLEAN,
  label: <TextWidget>flow.metaType.bool</TextWidget>,
}, {
  value: MetaValueType.DATE,
  label: <TextWidget>flow.metaType.date</TextWidget>,
}, {
  value: MetaValueType.DATETIME,
  label: <TextWidget>flow.metaType.dateTime</TextWidget>,
}]

// , {
//   value: MetaValueType.SINGLE_OPTION,
//   label: <TextWidget>flow.metaType.singleOption</TextWidget>,
// }, {
//   value: MetaValueType.MULTI_OPTION,
//   label: <TextWidget>flow.metaType.multiOption</TextWidget>,
// }

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
  [IFlowResourceType.VARIABLE]: <TextWidget>flow.autoFlow.variable</TextWidget>,
  [IFlowResourceType.VARIABLE_ARRAY]: <TextWidget>flow.autoFlow.variableArray</TextWidget>,
  [IFlowResourceType.VARIABLE_ARRAY_RECORD]: <TextWidget>flow.autoFlow.variableArrayRecord</TextWidget>,
  [IFlowResourceType.CONSTANT]: <TextWidget>flow.autoFlow.constant</TextWidget>,
  [IFlowResourceType.FORMULA]: <TextWidget>flow.autoFlow.formula</TextWidget>,
  [IFlowResourceType.TEMPLATE]: <TextWidget>flow.autoFlow.template</TextWidget>,
}

interface ResourceCreateProps {
  fieldMetas?: ICompareOperation[]
  flowGraph: AutoFlow
  opName?: string | JSX.Element
  isOpBtn?: boolean
  title?: string | JSX.Element
  value?: IFieldMetaFlow
  fieldType?: string
}

export const ResourceCreate:FC<ResourceCreateProps> = ({
  fieldMetas = [],
  flowGraph,
  opName = <TextWidget>flow.form.resourceCreate.addResource</TextWidget>,
  title = <TextWidget>flow.form.resourceCreate.addResource</TextWidget>,
  isOpBtn = true,
  value,
  fieldType
}) => {
  const useAsyncDataSource = (
    pattern: FormPathPattern,
    service: (
      field: Field
    ) => any
  ) => {
    onFieldReact(pattern, (field) => {
      const fieldObj = field as any
      fieldObj.loading = true
      const flowTypeValue = field.query('flowType').value()
      const isShow = flowTypeValue && flowTypeValue !== IFlowResourceType.TEMPLATE
      const isShowDefault = flowTypeValue === IFlowResourceType.VARIABLE || flowTypeValue === IFlowResourceType.CONSTANT
      field.display = isShow ? 'visible' : 'none'
      const valueTypeArray = field.query('valueType').value()
      const valueType = valueTypeArray ? valueTypeArray.length : undefined
      formData.setFieldState('defaultValue', (state) => {
        const valFlag = !valueType && fieldObj.value && fieldObj.value !== MetaValueType.MULTI_OPTION
          && fieldObj.value !== MetaValueType.SINGLE_OPTION && fieldObj.value !== MetaValueType.OBJECT;
        state.display = isShowDefault && valFlag ? 'visible' : 'none'
        console.log(isShowDefault, valFlag, state.display)
      })
      service(fieldObj).then(
        action(() => {
          // fieldObj.dataSource = data
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
      })
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useAsyncDataSource('type', async (field) => {
        const flowType = field.query('flowType').get('value')
        if (!flowType) return field.dataSource = []
        return new Promise((resolve) => {
          switch (flowType) {
            case IFlowResourceType.VARIABLE:
              field.dataSource = metaDataOps
              return resolve(metaDataOps);
            case IFlowResourceType.CONSTANT:
              const ops = constMetaOps.map((op) => {
                return metaDataOps.find((metaData) => metaData.value === op) 
              });
              field.dataSource = ops as any[]
              return resolve(ops as any[]);
            case IFlowResourceType.FORMULA:
              const Fops = formulaMetaOps.map((op) => {
                return metaDataOps.find((metaData) => metaData.value === op) 
              });
              field.dataSource = Fops as any[]
              return resolve(Fops as any[]);
            default:
              field.dataSource = []
              return resolve([]);
          }
        })
      })
      onFieldValueChange('type', (field) => {
        formData.setFieldState('formula', (state) => {
          const flowType = field.query('flowType').get('value')
          state.display = flowType === IFlowResourceType.FORMULA && field.value ? 'visible' : 'none'
        })
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
            title: <TextWidget>flow.form.resourceCreate.flowType</TextWidget>,
            'x-disabled': !!value,
            required: true,
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.flowType</TextWidget>
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
              placeholder: <TextWidget>flow.form.placeholder.flowType</TextWidget>
            },
            "x-decorator-props": {
              gridSpan: 2
            },
          },
          key: {
            type: 'string',
            title: <TextWidget>flow.form.comm.value</TextWidget>,
            required: true,
            // 'x-disabled': !!value,
            'x-validator': [{
              triggerType: 'onBlur',
              required: true,
              message: <TextWidget>flow.form.validator.value</TextWidget>,
            }, {
              triggerType: 'onBlur',
              validator: (val: string) => {
                if (!val) return null
                const message = new RepeatErrorMessage(flowGraph, val, value, apiReg)
                return message.errorMessage && <TextWidget>{message.errorMessage}</TextWidget>
              }
            }],
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-component-props': {
              placeholder: useLocale('flow.form.placeholder.name'),
            },
            "x-decorator-props": {
              gridSpan: 2
            },
          },
          description: {
            type: 'string',
            title: <TextWidget>flow.form.resourceCreate.description</TextWidget>,
            'x-decorator': 'FormItem',
            'x-component': 'Input.TextArea',
            "x-component-props": {
              placeholder: useLocale('flow.form.placeholder.description')
            },
            "x-decorator-props": {
              gridSpan: 2
            },
          },
          type: {
            type: 'string',
            title: <TextWidget>flow.form.resourceCreate.type</TextWidget>,
            required: true,
            'x-disabled': !!value,
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.type</TextWidget>
            },
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            'x-component-props': {
              placeholder: <TextWidget>flow.form.placeholder.type</TextWidget>
            },
          },
          valueType: {
            type: 'string',
            title: <TextWidget>flow.form.resourceCreate.valueType</TextWidget>,
            'x-disabled': !!value,
            enum: [
              {
                label: <TextWidget>flow.form.resourceCreate.valueTypeOption.array</TextWidget>,
                value: 'array',
              },
            ],
            'x-decorator': 'FormItem',
            'x-component': 'Checkbox.Group',
            'x-reactions': {
              dependencies: ['flowType'],
              fulfill: {
                schema: {
                  'x-display': "{{$deps == 'variables' ? 'visible' : 'none'}}",
                },
              },
            },
          },
          refObjectId: {
            type: 'string',
            title: <TextWidget>flow.form.resourceCreate.refObjectId</TextWidget>,
            required: true,
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.refObjectId</TextWidget>
            },
            'x-decorator': 'FormItem',
            'x-component': 'GatherInput',
            'x-component-props': {
              placeholder: <TextWidget>flow.form.placeholder.refObjectId</TextWidget>,
              flowGraph,
              disabled: !!value,
            },
            "x-decorator-props": {
              gridSpan: 1
            },
            'x-reactions': {
              dependencies: ['type'],
              fulfill: {
                schema: {
                  'x-display': "{{$deps == 'object' ? 'visible' : 'none'}}",
                },
              },
            },
          },
          defaultValue: {
            type: 'string',
            title: <TextWidget>flow.form.resourceCreate.defaultValue</TextWidget>,
            'x-decorator': 'FormItem',
            'x-component': 'GatherInput',
            'x-component-props': {
              flowGraph,
            },
            "x-decorator-props": {
              gridSpan: 2
            },
          },
          text: {
            type: 'string',
            title: <TextWidget>flow.form.resourceCreate.text</TextWidget>,
            required: true,
            'x-disabled': true,
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.text</TextWidget>
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
          formula: {
            type: 'string',
            title: <TextWidget>flow.form.resourceCreate.expression</TextWidget>,
            required: true,
            'x-validator': {
              required: true,
              message: <TextWidget>flow.form.validator.expression</TextWidget>
            },
            'x-visible': false,
            'x-decorator': 'FormItem',
            'x-component': 'FormulaEdit',
            'x-component-props': {
              flowGraph
            },
            "x-decorator-props": {
              gridSpan: 1
            },
          },
        },
      },
    },
  }

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form, setForm] = useState(formData)

  if (value) {
    const flowDataVal = clone(value)
    switch (fieldType) {
      case IFlowResourceType.VARIABLE_ARRAY:
      case IFlowResourceType.VARIABLE_ARRAY_RECORD:
        flowDataVal.flowType = IFlowResourceType.VARIABLE
        flowDataVal.valueType = 'array'
        flowDataVal.type = value?.items?.type
        break;
      case IFlowResourceType.VARIABLE_RECORD:
        flowDataVal.flowType = IFlowResourceType.VARIABLE
        break;
      default:
        flowDataVal.flowType = fieldType
        break;
    }
    form.setValues(flowDataVal)
  }

  const showModal = () => {
    formData.values = {}
    formData.clearErrors()
    setForm(formData)
    setIsModalVisible(true);
  };

  const submitResource = useCallback(
    (resourceData: IFieldMeta, flowDataType: IFlowResourceType) => {
      if (value) {
        flowGraph.editFlowMeta(flowDataType, resourceData, value.key)
      } else {
        flowGraph.addFlowMeta(flowDataType, resourceData)
      }
    },
    [fieldMetas]
  )

  const handleOk = () => {
    const obj: any = form.values;
    const resourceData: any = {
      description: obj.description,
      exclusiveMaximum: null,
      exclusiveMinimum: null,
      format: null,
      key: obj.key,
      maxLength: null,
      maximum: null,
      minLength: null,
      minimum: null,
      name: obj.key,
      options: null,
      pattern: null,
      primary: null,
      properties: null,
      required: null,
      type: obj.type,
      defaultValue: obj.defaultValue,
      refObjectId: obj.refObjectId,
      text: obj.text,
      calcType: obj.formula ? 'formula' : undefined,
      formula: obj.formula,
    }
    const register = flowGraph.registers.find((reg) => reg.id === obj.refObjectId)
    if (obj.refObjectId && obj.type === MetaValueType.OBJECT) {
      resourceData.refRegisterId = register?.id
    }
    const valueTypeLen = obj.valueType ? obj.valueType.length : undefined
    if (valueTypeLen) {
      resourceData.type = MetaValueType.ARRAY
      resourceData.items = {
        type: obj.type,
        properties: register?.properties,
      }
    } else if (obj.refObjectId && obj.type === MetaValueType.OBJECT) {
      resourceData.properties = register?.properties
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
        {
          isOpBtn ? <Button onClick={showModal} size="small">{opName}</Button>
          : <span onClick={showModal}>{opName}</span>
        }
      </div>
      <Modal width={900} title={title} visible={isModalVisible} cancelText={<TextWidget>flow.form.comm.cencel</TextWidget>} okText={<TextWidget>flow.form.comm.submit</TextWidget>} onOk={handleOk} onCancel={handleCancel}>
        <FormLayout layout='vertical' colon={false}>
          <FormProvider form={form}>
            <SchemaField schema={schema} />
          </FormProvider>
        </FormLayout>
      </Modal>
    </>
  )
}
