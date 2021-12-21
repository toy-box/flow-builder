import React, { FC, useState, CSSProperties, useRef } from 'react';
import { Modal, Input, Button } from 'antd';
import 'codemirror/lib/codemirror.css';
// import { FormulaEditor } from '@toy-box/form-formula';
import { IFieldMeta, MetaValueType } from '@toy-box/meta-schema';
import { ExpressionEditor } from '@toy-box/expression-editor';
import { TextWidget } from '../widgets'
import { useLocale } from '../../hooks'
import { AutoFlow } from '../../flow/models/AutoFlow'
import './index.less'

export interface AssignmentModelPorps {
  metaSchema?: Toybox.MetaSchema.Types.IFieldMeta[] | MetaSchemaObj
  value?: string
  onChange: (value: string) => void
  inputStyle?: CSSProperties
  valueType: MetaValueType
  flowGraph: AutoFlow
}

export interface MetaSchemaObj {
  groupId: string
  groupName: string
  list: IFieldMeta[]
}

export const FormulaModel:FC<AssignmentModelPorps> = ({
  // metaSchema,
  value,
  onChange,
  inputStyle,
  valueType,
  flowGraph
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formulaValue, setFormulaValue] = useState(value || '')
  const prefix = 'expression-input'
  const ref = useRef(null)
  const style = {
    border: '1px solid gray',
  };
  const variableMap: Record<string, IFieldMeta> = {};
  const callback = (res: any) => {
    setFormulaValue(res)
    console.log('回调结果：', res);
  };
  const customInputStyle = {
    ...inputStyle,
    cursor: 'pointer',
    background: '#fff',
  }

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    onChange(formulaValue)
  };

  const handleCancel = () => {
    setFormulaValue(value || '')
    setIsModalVisible(false);
  };

  // const metaSchema1 = [
  //   {
  //     description: null,
  //     exclusiveMaximum: null,
  //     exclusiveMinimum: null,
  //     format: null,
  //     key: 'deptId',
  //     maxLength: null,
  //     maximum: null,
  //     minLength: null,
  //     minimum: null,
  //     name: '部门',
  //     options: null,
  //     parentKey: 'parent_id',
  //     pattern: null,
  //     primary: null,
  //     properties: null,
  //     refObjectId: '5f9630d977b9ec42e4d0dca5',
  //     required: null,
  //     titleKey: 'name',
  //     type: 'objectId',
  //     unique: null,
  //     unBasic: true,
  //   },
  //   {
  //     description: null,
  //     exclusiveMaximum: null,
  //     exclusiveMinimum: null,
  //     format: null,
  //     key: 'date',
  //     maxLength: null,
  //     maximum: null,
  //     minLength: null,
  //     minimum: null,
  //     name: '日期',
  //     options: null,
  //     pattern: null,
  //     primary: null,
  //     properties: null,
  //     required: null,
  //     type: 'date',
  //   },
  //   {
  //     description: null,
  //     exclusiveMaximum: null,
  //     exclusiveMinimum: null,
  //     format: null,
  //     key: 'copId',
  //     maxLength: null,
  //     maximum: null,
  //     minLength: null,
  //     minimum: null,
  //     name: '公司',
  //     options: [
  //       {
  //         label: '12323232',
  //         value: '1',
  //       },
  //       {
  //         label: 'bbbbbbb',
  //         value: '2',
  //       },
  //     ],
  //     pattern: null,
  //     primary: null,
  //     properties: null,
  //     refObjectId: '5f9630d977b9ec42e4d0dca5',
  //     required: null,
  //     titleKey: 'name',
  //     type: 'singleOption',
  //     unique: null,
  //     unBasic: true,
  //   },
  // ];

  return (
    <>
      <Button className={prefix} title={formulaValue} onClick={showModal}>
        <div className={prefix + '-icon'}>=</div>
        {formulaValue.length > 0 ? (
            <div className={prefix + '-code'}>{formulaValue}</div>
          ) : (
            <div className={prefix + '-placeholder'}>
              {
                <TextWidget>flow.form.placeholder.formula</TextWidget>
              }
            </div>
          )}
        {/* <Input disabled style={customInputStyle} placeholder={useLocale('flow.placeholder.formula')} value={formulaValue}  /> */}
      </Button>
      <Modal width={900} 
        title={<TextWidget>flow.form.formula.editTitle</TextWidget>} 
        visible={isModalVisible} 
        cancelText={<TextWidget>flow.form.comm.cencel</TextWidget>} 
        okText={<TextWidget>flow.form.comm.submit</TextWidget>} onOk={handleOk} onCancel={handleCancel}>
        {isModalVisible && <ExpressionEditor
          value={formulaValue}
          variableMap={flowGraph.formulaMap}
          valueType={valueType}
          onChange={callback}
          width={'100%'}
          height={'400px'}
        />
        }
      </Modal>
    </>
  );
};