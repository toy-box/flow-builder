import React, { FC, useState, useCallback, useMemo } from 'react';
import { useNode } from '@toy-box/flow-nodes';
import { AssignmentModel, DecisionModel, SuspendModel, LoopModel,
  SortCollectionModel, RecordCreateModel, RecordUpdateModel,
  RecordRemoveModel, RecordLookUpModel } from '../../form-model';
import { FlowMetaTypes, FlowMetaParam } from '../../../flow/types'
import '../styles/extendPanel.less'
import { isBool } from '@formily/shared';

interface ExtendPanelProps {
  callbackFunc: (id: string, type: FlowMetaTypes, data: any) => void,
}

const MetaTypes = [
  {
    label: '分配',
    value: FlowMetaTypes.ASSIGNMENTS,
  },
  {
    label: '决策',
    value: FlowMetaTypes.DECISIONS,
  },
  {
    label: '暂停',
    value: FlowMetaTypes.SUSPENDS,
  },
  {
    label: '循环',
    value: FlowMetaTypes.LOOPS,
  },
  {
    label: '集合排序',
    value: FlowMetaTypes.SORT_COLLECTION_PROCESSOR,
  },
  {
    label: '创建记录',
    value: FlowMetaTypes.RECORD_CREATES,
  },
  {
    label: '更新记录',
    value: FlowMetaTypes.RECORD_UPDATES,
  },
  {
    label: '获取记录',
    value: FlowMetaTypes.RECORD_LOOKUPS,
  },
  {
    label: '删除记录',
    value: FlowMetaTypes.RECORD_DELETES,
  },
];

export const ExtendPanel: FC<ExtendPanelProps> = ({
  callbackFunc,
}) => {
  const node = useNode();
  const [showModel, setShowModel] = useState(false)
  const [flowMetaType, setFlowMetaType] = useState<FlowMetaTypes>()
  const style = {
    width: '150px',
    // padding: '8px',
  };
  const assignmentCallBack = useCallback(
    (data, type) => {
      if (!isBool(data)) {
        callbackFunc(node.node.id, type, data)
      }
      setShowModel(false)
      console.log(data, type)
    },
    [callbackFunc, node.node.id],
  );
  const onSubmit = useCallback(
    (type) => {
      setFlowMetaType(type)
      setShowModel(true)
    },
    [],
  );
  const models = useMemo(() => {
    switch (flowMetaType) {
      case FlowMetaTypes.ASSIGNMENTS:
        return <AssignmentModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaTypes) => assignmentCallBack(data, type)} />
      case FlowMetaTypes.DECISIONS:
        return <DecisionModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaTypes) => assignmentCallBack(data, type)} />
      case FlowMetaTypes.SUSPENDS:
        return <SuspendModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaTypes) => assignmentCallBack(data, type)} />
      case FlowMetaTypes.LOOPS:
        return <LoopModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaTypes) => assignmentCallBack(data, type)} />
      case FlowMetaTypes.SORT_COLLECTION_PROCESSOR:
        return <SortCollectionModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaTypes) => assignmentCallBack(data, type)} />
      case FlowMetaTypes.RECORD_CREATES:
        return <RecordCreateModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaTypes) => assignmentCallBack(data, type)} />
      case FlowMetaTypes.RECORD_UPDATES:
        return <RecordUpdateModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaTypes) => assignmentCallBack(data, type)} />
      case FlowMetaTypes.RECORD_LOOKUPS:
        return <RecordLookUpModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaTypes) => assignmentCallBack(data, type)} />
      case FlowMetaTypes.RECORD_DELETES:
        return <RecordRemoveModel showModel={showModel} callbackFunc={(data: FlowMetaParam | boolean, type?: FlowMetaTypes) => assignmentCallBack(data, type)} />
      default:
        return null
    }
  }, [assignmentCallBack, flowMetaType, showModel])
  return (
    <div className="extend-panel" style={style}>
      {/* <div>{node.node.id}</div> */}
      <ul className="extend-panel-ul">
        {MetaTypes.map((data) => <li key={data.value} className="extend-panel-li">
          <div onClick={() => onSubmit(data.value)} className="extend-panel-li-item">
            {data.label}
          </div>
        </li>
        )}
      </ul>
      {models}
    </div>
  );
};
