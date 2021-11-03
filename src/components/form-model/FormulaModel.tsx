import React, { FC, useState, CSSProperties } from 'react';
import { Modal, Input } from 'antd';
import 'codemirror/lib/codemirror.css';
import { FormulaEditor } from '@toy-box/form-formula';
import { IFieldMeta } from '@toy-box/meta-schema';
import { TextWidget } from '../widgets'
import { useLocale } from '../../hooks'

export interface AssignmentModelPorps {
  metaSchema?: Toybox.MetaSchema.Types.IFieldMeta[] | MetaSchemaObj
  value?: string
  onChange: (value: string) => void
  inputStyle?: CSSProperties,
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
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formulaValue, setFormulaValue] = useState(value || '')
  const style = {
    border: '1px solid gray',
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
      <div title={formulaValue} onClick={showModal}>
        <Input disabled style={customInputStyle} placeholder={useLocale('flow.placeholder.formula')} value={formulaValue}  />
      </div>
      <Modal width={900} title={<TextWidget>flow.form.formula.editTitle</TextWidget>} visible={isModalVisible} cancelText={<TextWidget>flow.form.comm.cencel</TextWidget>} okText={<TextWidget>flow.form.comm.submit</TextWidget>} onOk={handleOk} onCancel={handleCancel}>
        <FormulaEditor
          title={useLocale('flow.form.formula.formulaEditorTitle')}
          style={style}
          // metaSchema={metaSchema1}
          value={formulaValue}
          onChange={setFormulaValue}
          path={'projects.total'}
        />
      </Modal>
    </>
  );
};