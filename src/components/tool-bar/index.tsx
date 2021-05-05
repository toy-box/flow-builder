import React from 'react'
import { Tabs } from 'antd'
import FlowItemStore from '../flow-item-store'
import './styles';

const { TabPane } = Tabs

const ToolBar = () => {
  return (
    <div className="tool-bar">
      <Tabs defaultActiveKey="store">
        <TabPane tab="流程组件" key="store">
          <FlowItemStore />
        </TabPane>
        <TabPane tab="管理" key="manger">
          管理
        </TabPane>
      </Tabs>
    </div>
  );
}

export default ToolBar;
