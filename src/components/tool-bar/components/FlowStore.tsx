import React, { FC } from 'react'
import { FormProcess, Gateway } from '../../flow-item/components';
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
    </div>
  );
}

export default FlowStore
