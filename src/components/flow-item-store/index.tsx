import React, { FC } from 'react'
import { FormProcess, Gateway } from '../flow-item/components';
import FlowStoreItem from './components/FlowStoreItem';

const FlowItemStore: FC = () => {
  return (
    <div className={'flow-item-store'}>
      <FlowStoreItem title="Gateway" type="gateway" key="gateway">
        <Gateway />
      </FlowStoreItem>
      <FlowStoreItem title="FormProcess" type="formProcess" key="formProcess">
        <FormProcess />
      </FlowStoreItem>
    </div>
  );
}

export default FlowItemStore
