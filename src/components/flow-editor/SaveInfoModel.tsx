import React, { FC, useState, useCallback } from 'react';
import { Modal, Button } from 'antd';
import { clone, isArr } from '@toy-box/toybox-shared';
import 'codemirror/lib/codemirror.css';
import { AutoFlow } from '../../flow/models/AutoFlow'
import * as AutoFlowModelService from '../../services/autoFlowModel.servie'

export interface SaveInfoProps {
  flowGraph: AutoFlow
}

export const SaveInfoModel:FC<SaveInfoProps> = ({
  flowGraph
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [flowJsonData, setFlowJsonData] = useState()

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const saveData = useCallback(() => {
    const flowJson = clone(flowGraph.mataFlowJson.flow)
    for (const key in flowJson) {
      if (flowJson.hasOwnProperty(key)) {
        if (isArr(flowJson[key])) {
          flowJson[key].forEach((data: any) => {
            delete data.onEdit
          })
        }
      }
    }
    const href = window.location.href
    const flowId = href.split('?flowId=')[1]
    const params = {
      flowType: 'AUTO_START_UP',
      flows: flowJson,
      id: flowId || undefined
    }
    setIsModalVisible(true)
    setFlowJsonData(flowJson)
    AutoFlowModelService.saveAutoFlowModel(params)
  }, [flowGraph.mataFlowJson.flow])

  return (
    <>
      <Button onClick={saveData} className="right-btn" type="primary">保存</Button>
      <Modal width={900} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        {JSON.stringify(flowJsonData)}
      </Modal>
    </>
  );
};