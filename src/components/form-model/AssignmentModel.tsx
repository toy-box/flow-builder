import React, { FC, useState, useEffect, useCallback } from 'react';
import { Modal, Divider } from 'antd';
import { Input, FormItem, Select, FormLayout, FormGrid, PreviewText, FormButtonGroup } from '@formily/antd'
import { createForm } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { FilterBuilder } from '@toy-box/meta-components';
import { ResourceCreate } from './ResourceCreate'
import './index.less'
import {
  ICompareOperation,
} from '@toy-box/meta-schema'
import { fieldMetaStore } from '../../store'
import { observer } from '@formily/reactive-react'
export interface AssignmentModelPorps {
  showModel: boolean
  callbackFunc: (bool: boolean) => void
  title?: string
}

export const AssignmentModel:FC<AssignmentModelPorps> = observer(({
  showModel = false,
  callbackFunc,
  title= "新建分配"
}) => {
  const [isModalVisible, setIsModalVisible] = useState(showModel);
  const { fieldMetas, fieldServices } = fieldMetaStore.fieldMetaStore;
  
  useEffect(() => {
    setIsModalVisible(showModel);
  }, [showModel]);

  const handleOk = () => {
    form.submit((resolve) => {
      setIsModalVisible(false);
      callbackFunc(false)
    }).catch((rejected) => {
    })
  };

  useEffect(() => {
    console.log(fieldMetaStore.fieldMetaStore, 'fieldMetas')
  }, [])

  const handleCancel = () => {
    setIsModalVisible(false);
    callbackFunc(false)
  };

  const SchemaField = createSchemaField({
    components: {
      Input,
      FormItem,
      Select,
      FormLayout,
      FormGrid,
      PreviewText,
      FormButtonGroup
    },
  })
  
  const form = createForm()

  const schema = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 2,
        },
      // layout: {
      //   type: 'void',
      //   'x-component': 'FormLayout',
      //   'x-component-props': {
      //     labelCol: 6,
      //     wrapperCol: 10,
      //     colon: false,
      //     layout: 'vertical'
      //   },
        properties: {
          name: {
            type: 'string',
            title: '标签',
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Input'
          },
          id: {
            type: 'string',
            title: 'API名称',
            required: true,
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
        },
      },
    // },
    },
  }

  const [value, setValue] = useState([
    {
      source: 'deptId',
      op: '$eq',
      target: '1',
    },
  ])

  const handleFilter = useCallback(
    (logicFilter) => setValue(logicFilter),
    []
  )

  const specialOptions = [
    {
      label: '引用变量',
      value: 'REFERENCE',
    },
    {
      label: '直接输入',
      value: 'INPUT',
    },
  ]

  return (
    <>
      <Modal width={900} title={title} visible={isModalVisible} onOk={handleOk} cancelText="取消" okText="确认" onCancel={handleCancel}>
        <div className="assignment-index">
          <PreviewText.Placeholder value="暂无数据">
            <FormLayout layout='vertical' colon={false}>
              <FormProvider form={form}>
                <SchemaField schema={schema} />
              </FormProvider>
            </FormLayout>
          </PreviewText.Placeholder>
          <Divider />
          <div className="assignment-content">
            <div className="assignment-title">
              设置变量值
            </div>
            <div className="assignment-desc">
              每个变量由运算符和值组合修改。
            </div>
            <div className="assignment-add-btn">
              <ResourceCreate 
                fieldMetas={fieldMetas as any[]}
              />
            </div>
            <div className="assignment-filter-builder">
            <FilterBuilder
                fieldMetas={fieldMetas}
                value={value as any[]}
                filterFieldService={fieldServices}
                specialOptions={specialOptions}
                specialMode
                onChange={(filterItem: Partial<ICompareOperation>[]) =>
                  handleFilter(filterItem)
                }
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
});