import React, { FC, useState, CSSProperties } from 'react';
import { Modal, Input } from 'antd';
import 'codemirror/lib/codemirror.css';
import { FormulaEditor } from '@toy-box/form-formula';
import { IFieldMeta } from '@toy-box/meta-schema';

export interface AssignmentModelPorps {
  metaSchema: Toybox.MetaSchema.Types.IFieldMeta[] | MetaSchemaObj
  value: string
  onChange: (value: string) => void
  inputStyle?: CSSProperties
}

export interface MetaSchemaObj {
  groupId: string
  groupName: string
  list: IFieldMeta[]
}

export const FormulaModel:FC<AssignmentModelPorps> = ({
  metaSchema,
  value,
  onChange,
  inputStyle,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formulaValue, setFormulaValue] = useState(value)
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

  return (
    <>
      <div title={value} onClick={showModal}>
        <Input disabled style={customInputStyle} placeholder="请输入公式" value={value}  />
      </div>
      <Modal width={900} title="编辑公式" visible={isModalVisible} cancelText="取消" okText="确认" onOk={handleOk} onCancel={handleCancel}>
        <FormulaEditor
          title="meta公式型字段"
          style={style}
          // metaSchema={metaSchema}
          value={formulaValue}
          onChange={setFormulaValue}
          path={'projects.total'}
        />
      </Modal>
    </>
  );
};