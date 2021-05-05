import React from 'react'
import { Tabs } from 'antd'
import FlowStore from './components/FlowStore'

import './styles'

const { TabPane } = Tabs

const ToolBar = () => {
  return (
    <div className="tool-bar">
      <Tabs defaultActiveKey="store">
        <TabPane tab="流程组件" key="store">
          <FlowStore />
        </TabPane>
        <TabPane tab="管理" key="manger">
          管理
        </TabPane>
      </Tabs>
    </div>
  );
}

export default ToolBar;
