import React, { FC, useState, useEffect, useCallback } from 'react';
import { Modal, Divider } from 'antd';
import { Input, FormItem, Select, FormLayout, FormGrid, PreviewText, FormButtonGroup } from '@formily/antd'
import { createForm } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { FilterBuilder } from '@toy-box/meta-components';
import { ResourceCreate } from './ResourceCreate'
import update from 'immutability-helper'
import './index.less'
import {
  ICompareOperation,
} from '@toy-box/meta-schema'
import { fieldMetaStore } from '../../store'
import { observer } from 'mobx-react';
export interface AssignmentModelPorps {
  showModel: boolean
  callbackFunc: (bool: boolean) => void
}

export const AssignmentModel:FC<AssignmentModelPorps> = observer(({
  showModel = false,
  callbackFunc
}) => {
  const [isModalVisible, setIsModalVisible] = useState(showModel);
  const { fieldMetas, updateFieldMetas, fieldServices } = fieldMetaStore.fieldMetaStore;
  
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
          input: {
            type: 'string',
            title: '标签',
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Input'
          },
          input1: {
            type: 'string',
            title: 'API名称',
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
          },
          textarea: {
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

  const submitResource = useCallback(
    (resourceData) => {
      const metas = update(fieldMetas, { $push: [resourceData] })
      console.log(metas, '12332');
      updateFieldMetas(metas)
    },
    [fieldMetas, updateFieldMetas]
  )

  return (
    <>
      <Modal width={900} title="编辑分配" visible={isModalVisible} onOk={handleOk} cancelText="取消" okText="确认" onCancel={handleCancel}>
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
                submit={submitResource}
                fieldMetas={fieldMetas as any[]}
              />
            </div>
            <div className="assignment-filter-builder">
            <FilterBuilder
                fieldMetas={fieldMetas}
                value={value as any[]}
                filterFieldService={fieldServices}
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