import React, { FC } from 'react'
import { Tabs } from 'antd'
import FlowStore from './components/FlowStore'
import { fieldMetaStore } from '../../store'
import { observer } from '@formily/reactive-react'


import './styles'

const { TabPane } = Tabs

const ToolBar: FC = observer(() => {
  return (
    <div className="tool-bar">
      <Tabs defaultActiveKey="store">
        <TabPane tab="流程组件" key="store">
          <FlowStore />
        </TabPane>
        <TabPane tab="管理" key="manger">
        {
          fieldMetaStore.fieldMetaStore.fieldMetas.map((data: any) =>
          <div>
            {data?.children ? data?.children.map((child: any) => <div>{child.name}</div>) : data.name}
          </div>)
        }
        </TabPane>
      </Tabs>
    </div>
  );
})

export default ToolBar;
