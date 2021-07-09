import React, { FC, useState, useEffect, useCallback } from 'react';
import { Modal, Divider ,Button} from 'antd';
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
export interface AssignmentModelPorps {
  showModel: boolean
  callbackFunc: (bool: boolean) => void
}

export const AssignmentModel:FC<AssignmentModelPorps> = ({
  showModel = false,
  callbackFunc
}) => {
  const [isModalVisible, setIsModalVisible] = useState(showModel);
  
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

  const serviceTest = async function (resolve: { (value: unknown): void; (value: unknown): void; (value: unknown): void; (arg0: any): void; }, key: string) {
    setTimeout(() => {
      resolve(key)
    }, 100)
  }

  function findOptions(key: any, name: any) {
    return new Promise((resolve) => {
      serviceTest(resolve, key)
    }).then((res) => {
      return [
        {
          label: 'SIX',
          value: '123',
        },
        {
          label: 'named',
          value: '456',
        },
      ]
    })
  }

  function findOfValues(key: string, value: any) {
    return new Promise((resolve) => {
      serviceTest(resolve, key)
    }).then((res) => {
      if (key === 'deptId')
        return [{ id: '2', value: '1', title: 'Expand to load2' }]
      return [
        {
          label: 'SIX',
          value: '123',
        },
        {
          label: 'named',
          value: '456',
        },
      ]
    })
  }

  const genTreeNode = useCallback((parentId, isLeaf = false) => {
    const random = Math.random().toString(36).substring(2, 6)
    return {
      id: random,
      pId: parentId,
      value: random,
      title: isLeaf ? 'Tree Node' : 'Expand to load',
      isLeaf,
    }
  }, [])

  function findDataTrees(key: any, parentId: string) {
    return new Promise((resolve) => {
      serviceTest(resolve, key)
    }).then((res) => {
      if (parentId === '2')
        return [{ id: '3', pId: '2', value: '3', title: 'Expand to load3' }]
      if (parentId)
        return [{ id: '2', pId: '1', value: '2', title: 'Expand to load2' }]
      return [{ id: '1', pId: 0, value: '1', title: 'Expand to load' }]
    })
  }

  const filter = {
    filterFieldMetas: [
      {
        description: null,
        exclusiveMaximum: null,
        exclusiveMinimum: null,
        format: null,
        key: 'deptId',
        maxLength: null,
        maximum: null,
        minLength: null,
        minimum: null,
        name: '部门',
        options: null,
        parentKey: 'parent_id',
        pattern: null,
        primary: null,
        properties: null,
        refObjectId: '5f9630d977b9ec42e4d0dca5',
        required: null,
        titleKey: 'name',
        type: 'objectId',
        unique: null,
        unBasic: true,
      },
      {
        description: null,
        exclusiveMaximum: null,
        exclusiveMinimum: null,
        format: null,
        key: 'date',
        maxLength: null,
        maximum: null,
        minLength: null,
        minimum: null,
        name: '日期',
        options: null,
        pattern: null,
        primary: null,
        properties: null,
        required: null,
        type: 'date',
      },
      {
        description: null,
        exclusiveMaximum: null,
        exclusiveMinimum: null,
        format: null,
        key: 'copId',
        maxLength: null,
        maximum: null,
        minLength: null,
        minimum: null,
        name: '公司',
        options: [
          {
            label: '12323232',
            value: '1',
          },
          {
            label: 'bbbbbbb',
            value: '2',
          },
        ],
        pattern: null,
        primary: null,
        properties: null,
        refObjectId: '5f9630d977b9ec42e4d0dca5',
        required: null,
        titleKey: 'name',
        type: 'singleOption',
        unique: null,
        unBasic: true,
      },
    ],

    filterFieldService: {
      findOptions: (key: any, name: any) => findOptions(key, name),
      findOfValues: (key: any, value: any) => findOfValues(key, value),
      findDataTrees: (key: any, parentId: any) => findDataTrees(key, parentId),
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

  const [fieldMetas, setFieldMetas] = useState(filter.filterFieldMetas)

  const submitResource = useCallback(
    (resourceData) => {
      setFieldMetas(update(fieldMetas, { $push: [resourceData] }))
      console.log(resourceData, fieldMetas);
    },
    [filter.filterFieldMetas]
  )

  return (
    <>
      <Modal width={900} title="编辑分配" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
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
                fieldMetas={fieldMetas as any[]}
                value={value as any[]}
                filterFieldService={filter.filterFieldService as any}
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
};