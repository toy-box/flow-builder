import React, { FC, useState, CSSProperties } from 'react';
import { Modal, Button } from 'antd';
import 'codemirror/lib/codemirror.css';

export interface SaveInfoProps {
  data: any
  isFlag: boolean
  onCallBack: () => void
}

export const SaveInfoModel:FC<SaveInfoProps> = ({
  data,
  isFlag = false,
  onCallBack
}) => {
  const [isModalVisible, setIsModalVisible] = useState(isFlag);

  const handleOk = () => {
    setIsModalVisible(false);
    onCallBack()
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    onCallBack()
  };

  return (
    <>
      <Modal width={900} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        {JSON.stringify(data)}
      </Modal>
    </>
  );
};