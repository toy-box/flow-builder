import React, { FC } from 'react'
import { FormProcess, Gateway, Assignment } from '../../flow-item/components';
import FlowItem from './FlowItem';

import '../styles/flowStore.less';

const FlowStore: FC = () => {
  return (
    <div className={'flow-store'}>
      <FlowItem title="Gateway" type="gateway" key="gateway">
        <Gateway />
      </FlowItem>
      <FlowItem title="FormProcess" type="formProcess" key="formProcess">
        <FormProcess />
      </FlowItem>
      <FlowItem title="分配" type="assignment" key="assignment">
        <Assignment />
      </FlowItem>
    </div>
  );
}

export default FlowStore
